import { checkAdmin, checkRateLimit } from "./authHelper";
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
    maxRedemptions: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.insert("promotions", { ...args, redemptions: 0 });
  }
});

export const applyPromoCode = mutation({
  args: { code: v.string(), subtotal: v.number() },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, "applyPromoCode", 5, 60000);
    const now = Date.now();

    const promo = await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!promo || !promo.isActive || (promo.validUntil && now > promo.validUntil)) {
      return { valid: false, discountAmount: 0 };
    }

    if (promo.minOrderAmount && args.subtotal < promo.minOrderAmount) {
      return { valid: false, discountAmount: 0, error: `This code requires a minimum order of GH₵${promo.minOrderAmount}` };
    }

    if (promo.maxRedemptions && (promo.redemptions || 0) >= promo.maxRedemptions) {
      return { valid: false, discountAmount: 0, error: "This promo code has reached its usage limit." };
    }

    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = args.subtotal * (promo.discountValue / 100);
    } else if (promo.discountType === "fixed") {
      discountAmount = promo.discountValue;
    }

    return { valid: true, discountAmount };
  }
});

// Used by verifyAndCreate action to recalculate expected discount server-side
export const getPromoByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  }
});

