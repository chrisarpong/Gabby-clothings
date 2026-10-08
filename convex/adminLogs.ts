import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

import { requireStaff } from "./staffAuth";

export const logAction = mutation({
  args: {
      staffToken: v.string(),
    action: v.string(),
    details: v.optional(v.string()),
    category: v.optional(v.string()),
    targetId: v.optional(v.string()),
    targetType: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    deviceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    const adminName = staff.name || staff.email?.split('@')[0] || "Admin";

    await ctx.db.insert("adminLogs", {
      userId: staff._id,
      adminName: adminName,
      action: args.action,
      details: args.details,
      category: args.category,
      targetId: args.targetId,
      targetType: args.targetType,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      deviceName: args.deviceName,
      timestamp: Date.now(),
    });
  },
});

export const logInternalAction = internalMutation({
  args: {
    userId: v.union(v.id("staff"), v.null()),
    adminName: v.string(),
    action: v.string(),
    details: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("adminLogs", {
      userId: args.userId as any, 
      adminName: args.adminName,
      action: args.action,
      details: args.details,
      category: args.category,
      timestamp: Date.now(),
    });
  }
});

export const getRecentLogs = query({
  args: {
      staffToken: v.string(),
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    const limit = args.limit || 50;

    let query = ctx.db.query("adminLogs").order("desc");
    
    if (args.category) {
      query = ctx.db.query("adminLogs").withIndex("by_category", q => q.eq("category", args.category)).order("desc");
    }

    return await query.take(limit);
  },
});

export const getActiveSessions = query({
  args: {
      staffToken: v.string()
},
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    // Get all auth logs in the last 24 hours to find recent active sessions
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const logs = await ctx.db
      .query("adminLogs")
      .withIndex("by_category", q => q.eq("category", "auth"))
      .order("desc")
      .take(100);

    const activeSessions = new Map<string, any>();
    
    for (const log of logs) {
      if (log.userId && log._creationTime > oneDayAgo && !activeSessions.has(log.userId)) {
        if (log.action.includes("Logged In")) {
           activeSessions.set(log.userId, log);
        }
      }
    }

    return Array.from(activeSessions.values());
  },
});
