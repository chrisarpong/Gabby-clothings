import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return cart?.items || [];
  },
});

export const syncCart = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantSku: v.optional(v.string()),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { items: args.items });
    } else {
      await ctx.db.insert("carts", {
        userId: identity.subject,
        items: args.items,
      });
    }
  },
});

export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { items: [] });
    }
  },
});
