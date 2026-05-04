import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";

export const validateCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const promo = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (promo && promo.isActive) {
      return promo.discountPercentage;
    }
    return null;
  },
});

// Admin: Fetch all promo codes
export const getPromoCodes = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("promoCodes").order("desc").take(100);
  },
});

// Admin: Create a new promo code
export const createPromoCode = mutation({
  args: {
    code: v.string(),
    discountPercentage: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("promoCodes", {
      code: args.code.toUpperCase(),
      discountPercentage: args.discountPercentage,
      isActive: args.isActive,
    });
  },
});

// Admin: Toggle a promo code's active status
export const togglePromoCode = mutation({
  args: {
    promoId: v.id("promoCodes"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.promoId, { isActive: args.isActive });
    return { success: true };
  },
});
