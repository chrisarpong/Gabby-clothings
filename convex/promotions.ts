import { checkRateLimit } from "./authHelper";
import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireStaff } from "./staffAuth";

export const getPromoCodes = query({
  args: {
      staffToken: v.string()
},
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "promotions" });
    return await ctx.db.query("promotions").order("desc").take(500);
  }
});

function validatePromoFields(args: {
  discountType: string;
  discountValue: number;
  validUntil?: number;
  maxRedemptions?: number;
  minOrderAmount?: number;
}) {
  if (args.discountType !== "percentage" && args.discountType !== "fixed") throw new ConvexError("Discount type must be percentage or fixed.");
  if (!Number.isFinite(args.discountValue) || args.discountValue <= 0 || (args.discountType === "percentage" && args.discountValue > 100)) {
    throw new ConvexError("Discount value is outside the allowed range.");
  }
  if (args.validUntil !== undefined && (!Number.isFinite(args.validUntil) || args.validUntil <= Date.now())) throw new ConvexError("Promo expiry must be in the future.");
  if (args.maxRedemptions !== undefined && (!Number.isSafeInteger(args.maxRedemptions) || args.maxRedemptions < 1)) throw new ConvexError("Maximum redemptions must be a positive integer.");
  if (args.minOrderAmount !== undefined && (!Number.isFinite(args.minOrderAmount) || args.minOrderAmount < 0)) throw new ConvexError("Minimum order amount must be non-negative.");
}

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
    validatePromoFields(args);
    const existing = await ctx.db.query("promotions").withIndex("by_code", q => q.eq("code", code)).first();
    if (existing) throw new ConvexError("A promo code with this name already exists.");
    const id = await ctx.db.insert("promotions", {
      code,
      discountType: args.discountType,
      discountValue: args.discountValue,
      validUntil: args.validUntil,
      isActive: args.isActive,
      maxRedemptions: args.maxRedemptions,
      minOrderAmount: args.minOrderAmount,
      redemptions: 0,
    });
    await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Created promo code", details: JSON.stringify({ code }), category: "promotions", targetId: id, targetType: "promotion", timestamp: Date.now() });
    return id;
  }
});

export const updatePromoCode = mutation({
  args: {
    staffToken: v.string(),
    id: v.id("promotions"),
    discountValue: v.number(),
    validUntil: v.optional(v.number()),
    maxRedemptions: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "promotions" });
    const promo = await ctx.db.get(args.id);
    if (!promo) throw new ConvexError("Promo code not found.");
    validatePromoFields({ ...args, discountType: promo.discountType, validUntil: args.validUntil !== promo.validUntil ? args.validUntil : undefined });
    if (args.maxRedemptions !== undefined && args.maxRedemptions < (promo.redemptions || 0)) throw new ConvexError("Maximum redemptions cannot be below current redemptions.");
    const oldValues = { discountValue: promo.discountValue, validUntil: promo.validUntil, maxRedemptions: promo.maxRedemptions, minOrderAmount: promo.minOrderAmount, isActive: promo.isActive };
    const newValues = { discountValue: args.discountValue, validUntil: args.validUntil, maxRedemptions: args.maxRedemptions, minOrderAmount: args.minOrderAmount, isActive: args.isActive };
    await ctx.db.patch(args.id, newValues);
    await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Updated promo code", details: JSON.stringify({ code: promo.code, old: oldValues, new: newValues }), category: "promotions", targetId: args.id, targetType: "promotion", timestamp: Date.now() });
  },
});

export const setPromoActive = mutation({
  args: { staffToken: v.string(), id: v.id("promotions"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "promotions" });
    const promo = await ctx.db.get(args.id);
    if (!promo) throw new ConvexError("Promo code not found.");
    await ctx.db.patch(args.id, { isActive: args.isActive });
    await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Toggled promo code", details: JSON.stringify({ code: promo.code, old: promo.isActive, new: args.isActive }), category: "promotions", targetId: args.id, targetType: "promotion", timestamp: Date.now() });
  },
});

export const deletePromoCode = mutation({
  args: { staffToken: v.string(), id: v.id("promotions") },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "promotions" });
    const promo = await ctx.db.get(args.id);
    if (!promo) throw new ConvexError("Promo code not found.");
    if ((promo.redemptions || 0) > 0) throw new ConvexError("Promo code has redemptions; deactivate instead.");
    await ctx.db.delete(args.id);
    await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Deleted promo code", details: JSON.stringify({ code: promo.code }), category: "promotions", targetId: args.id, targetType: "promotion", timestamp: Date.now() });
  },
});

export const applyPromoCode = mutation({
  args: { code: v.string(), subtotal: v.number() },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, "applyPromoCode", 5, 60000, args.code);
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
export const getPromoByCode = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  }
});

