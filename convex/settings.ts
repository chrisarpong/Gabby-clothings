import { checkAdmin } from "./authHelper";
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
];

export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    // If the key is not public, require admin authentication
    if (!PUBLIC_SETTING_KEYS.includes(args.key)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Unauthenticated");
      await checkAdmin(ctx, identity);
    }

    return await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.query("settings").collect();
  },
});

export const setSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: identity.subject,
      });
    }

    return await ctx.db.insert("settings", {
      key: args.key,
      value: args.value,
      updatedBy: identity.subject,
    });
  },
});
