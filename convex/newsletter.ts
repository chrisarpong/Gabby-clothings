import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!existing) {
      await ctx.db.insert("newsletter", {
        email: args.email,
        subscribedAt: Date.now(),
      });
    }
    return { success: true };
  },
});

export const getSubscribers = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("newsletter").order("desc").collect();
  },
});
