import { requireStaff } from "./staffAuth";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Keys that are safe to expose to unauthenticated visitors (storefront UI).
const PUBLIC_SETTING_KEYS = [
  "maintenanceMode",
  "isBannerActive",
  "announcementBannerText",
  "bannerStyle",
  "commercials",
  "availability",
  "currency",
  "standardShippingRate",
  "bookingDepositAmount",
  "freeShippingThreshold",
  "taxRate",
  "returnWindowDays",
  "storeInfo",
  "seoDefaults",
  "lowStockThreshold",
  "depositPercentages",
];

export const getByKey = query({
  args: { key: v.string(), staffToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // If the key is not public, require admin authentication
    if (!PUBLIC_SETTING_KEYS.includes(args.key)) {
      if (!args.staffToken) throw new Error("Unauthenticated");
      await requireStaff(ctx, args.staffToken, { permission: "dashboard" });
    }

    return await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});

export const getAll = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "dashboard" });
    return await ctx.db.query("settings").collect();
  },
});

export const setSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    staffToken: v.string(),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "dashboard" });

    if (args.key.startsWith("manualRate")) {
      throw new Error("Manual exchange rates must be changed through currency rate management.");
    }

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: staff._id,
      });
    }

    return await ctx.db.insert("settings", {
      key: args.key,
      value: args.value,
      updatedBy: staff._id,
    });
  },
});
