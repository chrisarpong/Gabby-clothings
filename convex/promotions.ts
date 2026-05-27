import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPromoCodes = query({
  args: {},
  handler: async (ctx) => {
    // Basic auth check
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
    if (!identity) throw new Error("Unauthorized");
    return await ctx.db.insert("promotions", args);
  }
});
