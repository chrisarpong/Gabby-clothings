import { v } from "convex/values";
import { query } from "./_generated/server";

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
