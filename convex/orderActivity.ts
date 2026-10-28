import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireStaff } from "./staffAuth";

export const getByOrder = query({
  args: {
    staffToken: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: ["designer_portal", "orders"] });
    if (staff.role === "designer") {
      const order = await ctx.db.get(args.orderId);
      if (!order || String(order.assignedDesignerId) !== String(staff._id)) {
        throw new Error("This order is not assigned to this designer.");
      }
    }
    const logs = await ctx.db
      .query("orderActivityLog")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .order("asc")
      .collect();

    // Attach user details to each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.performedBy as Id<"staff">);
        return {
          ...log,
          performedByName: user ? user.name : "Unknown User",
        };
      })
    );

    return logsWithUsers;
  },
});

export const addNote = mutation({
  args: {
    staffToken: v.string(),
    orderId: v.id("orders"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: ["designer_portal", "orders"] });
    if (staff.role === "designer") {
      const order = await ctx.db.get(args.orderId);
      if (!order || String(order.assignedDesignerId) !== String(staff._id)) {
        throw new Error("This order is not assigned to this designer.");
      }
    }
    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: "note",
      performedBy: staff._id,
      note: args.note,
      timestamp: Date.now(),
    });
  },
});
