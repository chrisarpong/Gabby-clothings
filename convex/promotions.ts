import { checkRateLimit } from "./authHelper";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireStaff } from "./staffAuth";

export const getPromoCodes = query({
  args: {
      staffToken: v.string()
},
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "promotions" });
    return await ctx.db.query("promotions").order("desc").collect();
  }
});

export const createPromoCode = mutation({
  args: {
      staffToken: v.string(),
    code: v.string(),
    discountType: v.string(),
    discountValue: v.number(),
    validUntil: v.optional(v.number()),
    isActive: v.boolean(),
    maxRedemptions: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "promotions" });
    const code = args.code.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) throw new ConvexError("Promo code must be 3-32 letters, numbers, hyphens, or underscores.");
    if (args.discountType !== "percentage" && args.discountType !== "fixed") throw new ConvexError("Discount type must be percentage or fixed.");
    if (!Number.isFinite(args.discountValue) || args.discountValue <= 0 || (args.discountType === "percentage" && args.discountValue > 100)) {
      throw new ConvexError("Discount value is outside the allowed range.");
    }
    if (args.validUntil !== undefined && (!Number.isFinite(args.validUntil) || args.validUntil <= Date.now())) throw new ConvexError("Promo expiry must be in the future.");
    if (args.maxRedemptions !== undefined && (!Number.isSafeInteger(args.maxRedemptions) || args.maxRedemptions < 1)) throw new ConvexError("Maximum redemptions must be a positive integer.");
    if (args.minOrderAmount !== undefined && (!Number.isFinite(args.minOrderAmount) || args.minOrderAmount < 0)) throw new ConvexError("Minimum order amount must be non-negative.");
    const existing = await ctx.db.query("promotions").withIndex("by_code", q => q.eq("code", code)).first();
    if (existing) throw new ConvexError("A promo code with this name already exists.");
    return await ctx.db.insert("promotions", {
      code,
      discountType: args.discountType,
      discountValue: args.discountValue,
      validUntil: args.validUntil,
      isActive: args.isActive,
      maxRedemptions: args.maxRedemptions,
      minOrderAmount: args.minOrderAmount,
      redemptions: 0,
    });
  }
});

export const applyPromoCode = mutation({
  args: { code: v.string(), subtotal: v.number() },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, "applyPromoCode", 5, 60000);
    if (!Number.isFinite(args.subtotal) || args.subtotal < 0) return { valid: false, discountAmount: 0 };
    const now = Date.now();
    const code = args.code.trim().toUpperCase();

    const promo = await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", code))
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

    return { valid: true, discountAmount: Math.min(args.subtotal, Math.max(0, discountAmount)) };
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

