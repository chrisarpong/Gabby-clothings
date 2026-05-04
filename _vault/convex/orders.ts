import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";
import type { Id } from "./_generated/dataModel";

export const createOrder = mutation({
  args: {
    paystackReference: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        quantity: v.number(),
      })
    ),
    shippingFee: v.number(),
    shippingAddress: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      region: v.string(),
      country: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity ? identity.tokenIdentifier : undefined;

    let calculatedTotal = 0;
    const enrichedItems = [];

    // --- SERVER-SIDE PRICE VERIFICATION & INVENTORY DEDUCTION ---
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId as Id<"products">);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // 1. Calculate price from DB, not client
      const priceAtTime = product.price;
      calculatedTotal += priceAtTime * item.quantity;

      // 2. Prepare item for record with secure price
      enrichedItems.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        priceAtTime: priceAtTime,
      });

      // 3. Deduct stock
      if (product.stock !== undefined) {
        if (product.stock < item.quantity) {
          throw new Error(`Out of stock: ${product.name}`);
        }
        await ctx.db.patch(product._id, {
          stock: product.stock - item.quantity
        });
      }
    }

    // Insert the order using the calculatedTotal
    const orderId = await ctx.db.insert("orders", {
      userId,
      paystackReference: args.paystackReference,
      items: enrichedItems,
      totalAmount: calculatedTotal,
      shippingFee: args.shippingFee,
      status: "pending",
      shippingAddress: args.shippingAddress,
    });

    // Clear the user's cart (only if authenticated)
    if (userId) {
      const cartItems = await ctx.db
        .query("cartItems")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      for (const item of cartItems) {
        await ctx.db.delete(item._id);
      }
    }

    return orderId;
  },
});

export const getOrders = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, { status: args.status });
    return { success: true };
  },
});

export const getMyOrders = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .collect();
  },
});

export const getOrderByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("paystackReference", args.reference))
      .first();
  },
});

export const markOrderProcessing = mutation({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    // NOTE: In a production environment, verify Paystack signature here.
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("paystackReference", args.reference))
      .first();
    if (order && order.status === "pending") {
      await ctx.db.patch(order._id, { status: "processing" });
    }
  },
});
