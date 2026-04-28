import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users"; // Importing the security block
import { Id } from "./_generated/dataModel";

// 1. Create a new order after a successful Paystack payment
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
      country: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // If they are logged in, grab their ID. If not, leave it undefined (guest).
    const userId = identity ? identity.tokenIdentifier : undefined;

    // --- INVENTORY DEDUCTION ---
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId as Id<"products">);
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Out of stock: ${product.name}`);
      }
      
      await ctx.db.patch(product._id, {
        stock: product.stock - item.quantity
      });
    }

    // Insert the order
    const orderId = await ctx.db.insert("orders", {
      userId,
      paystackReference: args.paystackReference,
      items: args.items,
      totalAmount: args.totalAmount,
      shippingFee: args.shippingFee,
      status: "pending", // Changed default to "pending" to match standard flow
      shippingAddress: args.shippingAddress,
    });

    // Clear the user's cart after successful order (only if authenticated)
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

// 2. Admin: Fetch all orders (SECURE)
export const getOrders = query({
  handler: async (ctx) => {
    await requireAdmin(ctx); // Block non-admins
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// 3. Admin: Update Order Status (NEW)
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
    await requireAdmin(ctx); // Block non-admins

    await ctx.db.patch(args.orderId, {
      status: args.status,
    });

    return { success: true };
  },
});

// 4. User: Fetch their own orders
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

// 5. Get a single order by its Paystack reference
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

// 6. Webhook: Mark Order as Processing
export const markOrderProcessing = mutation({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("paystackReference", args.reference))
      .first();
    if (order && order.status === "pending") {
      await ctx.db.patch(order._id, { status: "processing" });
    }
  },
});
