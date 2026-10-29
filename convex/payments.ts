import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { requireStaff } from "./staffAuth";

export const recordCashPayment = mutation({
  args: {
      staffToken: v.string(),
    orderId: v.id("orders"),
    amount: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("momo"), v.literal("transfer")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "financials" });
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === "cancelled") throw new Error("Cancelled orders cannot receive payments.");
    if (!Number.isFinite(args.amount) || args.amount <= 0) throw new Error("Payment amount must be positive.");
    const currentDue = Math.max(0, order.amountDue ?? ((order.totalAmount || 0) - (order.amountPaid || 0)));
    if (args.amount > currentDue) throw new Error("Payment cannot exceed the amount due.");

    // Record the payment
    const paymentId = await ctx.db.insert("payments", {
      orderId: args.orderId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      recordedBy: staff._id,
      notes: args.notes,
      date: new Date().toISOString(),
    });

    // Update the order's amount paid
    const newAmountPaid = (order.amountPaid || 0) + args.amount;
    const amountDue = Math.max(0, (order.totalAmount || 0) - newAmountPaid);
    
    let paymentStatus = "pending";
    if (newAmountPaid > 0 && amountDue > 0) paymentStatus = "partial";
    if (amountDue <= 0) paymentStatus = "paid";

    await ctx.db.patch(args.orderId, {
      amountPaid: newAmountPaid,
      amountDue: amountDue,
      paymentStatus: paymentStatus,
    });

    await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Recorded manual order payment", details: JSON.stringify({ orderId: args.orderId, amount: args.amount, method: args.paymentMethod }), category: "financials", timestamp: Date.now() });

    return paymentId;
  },
});

export const getByOrder = query({
  args: {
    staffToken: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "financials" });
    return await ctx.db
      .query("payments")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});
