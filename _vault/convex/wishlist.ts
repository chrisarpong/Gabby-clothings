import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleWishlist = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to save to wishlist.");
    }
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { added: false };
    } else {
      await ctx.db.insert("wishlists", {
        userId,
        productId: args.productId,
      });
      return { added: true };
    }
  },
});

export const getUserWishlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.tokenIdentifier;

    const items = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const products = await Promise.all(
      items.map(async (item) => {
        return await ctx.db.get(item.productId);
      })
    );
    return products.filter((p) => p !== null);
  },
});
