import { checkAdmin } from "./authHelper";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPromoCodes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.query("promotions").order("desc").collect();
  }
});

export const createPromoCode = mutation({
  args: {
    code: v.string(),
    discountType: v.string(),
    discountValue: v.number(),
    validUntil: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.insert("promotions", args);
  }
});

export const validateCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const promo = await ctx.db
      .query("promotions")
      .filter((q) => q.eq(q.field("code"), args.code))
      .first();

    if (!promo) {
      throw new Error("Invalid promo code");
    }

    if (!promo.isActive) {
      throw new Error("This promo code is no longer active");
    }

    if (promo.validUntil && Date.now() > promo.validUntil) {
      throw new Error("This promo code has expired");
    }

    return {
      _id: promo._id,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    };
  }
});
