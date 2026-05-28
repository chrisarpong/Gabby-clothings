import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if ((identity as any).role !== "admin") throw new Error("Unauthorized: Admin access required");
    return await ctx.db.query("subscribers").order("desc").collect();
  },
});

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
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
