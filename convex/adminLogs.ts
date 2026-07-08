import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./authHelper";

export const logAction = mutation({
  args: {
    action: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    await checkAdmin(ctx, identity);

    const adminName = identity.name || identity.email?.split('@')[0] || "Admin";

    await ctx.db.insert("adminLogs", {
      userId: identity.subject,
      adminName: adminName,
      action: args.action,
      details: args.details,
    });
  },
});

export const getRecentLogs = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const limit = args.limit || 50;

    return await ctx.db
      .query("adminLogs")
      .order("desc")
      .take(limit);
  },
});
