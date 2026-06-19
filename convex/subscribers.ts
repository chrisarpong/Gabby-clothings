import { checkAdmin } from "./authHelper";
import { query, mutation } from "./_generated/server";
import { checkRateLimit } from "./authHelper";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.query("subscribers").order("desc").collect();
  },
});

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, "subscribe", 5, 60000); // 5 per minute

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("subscribers", {
      email: args.email,
      status: "active",
    });
  },
});
