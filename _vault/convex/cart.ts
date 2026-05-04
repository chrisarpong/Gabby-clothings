import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get cart items for the authenticated user, with product details joined
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.tokenIdentifier;

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(50);

    // Join with product data
    const cartWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    // Filter out items whose product may have been deleted
    return cartWithProducts.filter((item) => item.product !== null);
  },
});

// Add item to cart (or update quantity if it already exists)
export const addToCart = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in to add to cart");
    }
    const userId = identity.tokenIdentifier;

    // Check if item already in cart
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
      return existing._id;
    }

    return await ctx.db.insert("cartItems", {
      userId,
      productId: args.productId,
      quantity: args.quantity,
    });
  },
});

// Update quantity for a cart item
export const updateQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in");
    }

    if (args.quantity < 1) {
      await ctx.db.delete(args.cartItemId);
      return;
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in");
    }

    await ctx.db.delete(args.cartItemId);
  },
});

// Clear all cart items for the authenticated user
export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in");
    }
    const userId = identity.tokenIdentifier;

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(200);

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});

// Merge guest cart into server cart (called when user signs in)
export const mergeGuestCart = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in to merge cart");
    }
    const userId = identity.tokenIdentifier;

    for (const guestItem of args.items) {
      const existing = await ctx.db
        .query("cartItems")
        .withIndex("by_user_and_product", (q) =>
          q.eq("userId", userId).eq("productId", guestItem.productId)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          quantity: existing.quantity + guestItem.quantity,
        });
      } else {
        await ctx.db.insert("cartItems", {
          userId,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
        });
      }
    }
  },
});
