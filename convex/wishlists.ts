import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleItem = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let wishlist = await ctx.db
      .query("wishlists")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!wishlist) {
      await ctx.db.insert("wishlists", { userId: identity.subject, items: [args.productId] });
      return;
    }

    const items = wishlist.items;
    if (items.includes(args.productId)) {
      // Remove
      await ctx.db.patch(wishlist._id, { items: items.filter(id => id !== args.productId) });
    } else {
      // Add
      await ctx.db.patch(wishlist._id, { items: [...items, args.productId] });
    }
  }
});

export const getUserWishlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const wishlist = await ctx.db
      .query("wishlists")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!wishlist) return [];
    
    // fetch full products
    const products = [];
    for (const id of wishlist.items) {
      const p = await ctx.db.get(id);
      if (p) products.push(p);
    }
    return products;
  }
});
