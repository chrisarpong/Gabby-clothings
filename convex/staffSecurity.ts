import { mutation, query, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireStaff } from "./staffAuth";

export const DEFAULT_SMS_SETTINGS = {
  smsResetEnabled: false,
  smsResetAllowedRoles: ["designer", "sales"],
  smsDailyCap: 30,
};

export const getSmsSettings = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    if (caller.role !== "ceo") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Only the CEO can view security settings." });
    }
    const settings = await ctx.db.query("staffSecuritySettings").first();
    const config = settings || DEFAULT_SMS_SETTINGS;

    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const sentToday = (
      await ctx.db
        .query("staffSmsLog")
        .withIndex("by_createdAt", q => q.gte("createdAt", startOfToday))
        .collect()
    ).filter(log => log.outcome === "sent").length;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7Days = (
      await ctx.db
        .query("staffSmsLog")
        .withIndex("by_createdAt", q => q.gte("createdAt", sevenDaysAgo))
        .collect()
    ).filter(log => log.outcome === "sent").length;

    return {
      smsResetEnabled: config.smsResetEnabled,
      smsResetAllowedRoles: config.smsResetAllowedRoles,
      smsDailyCap: config.smsDailyCap,
      sentToday,
      last7Days,
    };
  },
});

export const getRecentSmsAttempts = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    if (caller.role !== "ceo") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Only the CEO can view SMS attempts." });
    }
    const rows = await ctx.db.query("staffSmsLog").withIndex("by_createdAt").order("desc").take(20);
    return rows.map(row => ({
      time: row.createdAt,
      purpose: row.purpose,
      outcome: row.outcome,
      via: row.via,
      maskedPhone: row.maskedPhone,
      failureCode: row.failureCode,
      providerMessage: row.providerMessage,
    }));
  },
});

export const updateSmsSettings = mutation({
  args: {
    staffToken: v.string(),
    smsResetEnabled: v.boolean(),
    smsResetAllowedRoles: v.array(v.string()),
    smsDailyCap: v.number(),
  },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    if (caller.role !== "ceo") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Only the CEO can update security settings." });
    }

    const clampedCap = Math.min(200, Math.max(5, Math.round(args.smsDailyCap)));
    const validRoles = ["ceo", "admin", "designer", "sales"];
    const filteredRoles = args.smsResetAllowedRoles.filter(role => validRoles.includes(role));

    const existing = await ctx.db.query("staffSecuritySettings").first();
    const oldDetails = existing
      ? `enabled=${existing.smsResetEnabled}, roles=${existing.smsResetAllowedRoles.join(",")}, cap=${existing.smsDailyCap}`
      : "defaults";
    const newDetails = `enabled=${args.smsResetEnabled}, roles=${filteredRoles.join(",")}, cap=${clampedCap}`;

    if (existing) {
      await ctx.db.patch(existing._id, {
        smsResetEnabled: args.smsResetEnabled,
        smsResetAllowedRoles: filteredRoles,
        smsDailyCap: clampedCap,
        updatedAt: Date.now(),
        updatedBy: caller._id,
      });
    } else {
      await ctx.db.insert("staffSecuritySettings", {
        smsResetEnabled: args.smsResetEnabled,
        smsResetAllowedRoles: filteredRoles,
        smsDailyCap: clampedCap,
        updatedAt: Date.now(),
        updatedBy: caller._id,
      });
    }

    await ctx.db.insert("adminLogs", {
      userId: caller._id,
      adminName: caller.name,
      action: "Updated SMS Reset Settings",
      details: `Old: ${oldDetails}; New: ${newDetails}`,
      category: "team",
      targetId: existing?._id ?? caller._id,
      targetType: "settings",
      timestamp: Date.now(),
    });

    return {
      smsResetEnabled: args.smsResetEnabled,
      smsResetAllowedRoles: filteredRoles,
      smsDailyCap: clampedCap,
    };
  },
});

export const getInternalSmsConfig = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("staffSecuritySettings").first();
    return settings || DEFAULT_SMS_SETTINGS;
  },
});

