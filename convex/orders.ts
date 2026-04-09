import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Create a new order after successful Paystack payment
export const createOrder = mutation({
  args: {
    paystackReference: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        quantity: v.number(),
        priceAtTime: v.number(),
      })
    ),
    totalAmount: v.number(),
    shippingFee: v.number(),
    shippingAddress: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      region: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in to place an order.");
    }
    const userId = identity.tokenIdentifier;

    // Insert the order
    const orderId = await ctx.db.insert("orders", {
      userId,
      paystackReference: args.paystackReference,
      items: args.items,
      totalAmount: args.totalAmount,
      shippingFee: args.shippingFee,
      status: "processing",
      shippingAddress: args.shippingAddress,
    });

    // Clear the user's cart after successful order
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return orderId;
  },
});

// 2. Admin: Fetch all orders
export const getOrders = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// 3. User: Fetch their own orders
export const getMyOrders = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// 4. Get a single order by its Paystack reference
export const getOrderByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) =>
        q.eq("paystackReference", args.reference)
      )
      .first();
  },
});
