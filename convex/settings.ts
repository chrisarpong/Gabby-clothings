import { requireStaff } from "./staffAuth";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
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

const FINANCIAL_SETTING_KEYS = new Set([
  "standardShippingRate",
  "bookingDepositAmount",
  "freeShippingThreshold",
  "taxRate",
  "depositPercentages",
  "currency",
  "safetyBufferPercentage",
]);

const NON_NEGATIVE_NUMBER_KEYS = new Set([
  "standardShippingRate",
  "bookingDepositAmount",
  "freeShippingThreshold",
  "taxRate",
  "returnWindowDays",
  "lowStockThreshold",
  "safetyBufferPercentage",
]);

// GHS 10,000 is a deliberately generous cap for a single standard shipping fee.
const MAX_STANDARD_SHIPPING_RATE = 10_000;

export const getByKey = query({
  args: { key: v.string(), staffToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // If the key is not public, require admin authentication
    if (!PUBLIC_SETTING_KEYS.includes(args.key)) {
      if (!args.staffToken) throw new Error("Unauthenticated");
      await requireStaff(ctx, args.staffToken, { permission: "settings" });
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
    await requireStaff(ctx, args.staffToken, { permission: "settings" });
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
    if (args.key === "orderCounter") {
      throw new Error("orderCounter is reserved for order creation and cannot be edited here.");
    }

    if (args.key.startsWith("manualRate")) {
      throw new Error("Manual exchange rates must be changed through currency rate management.");
    }

    const staff = await requireStaff(ctx, args.staffToken, { permission: "settings" });
    if (FINANCIAL_SETTING_KEYS.has(args.key)) {
      await requireStaff(ctx, args.staffToken, { permission: "financials" });
    }

    if (NON_NEGATIVE_NUMBER_KEYS.has(args.key)) {
      if (typeof args.value !== "number" || !Number.isFinite(args.value) || args.value < 0) {
        throw new Error(`${args.key} must be a finite number greater than or equal to zero.`);
      }
      if (args.key === "standardShippingRate" && args.value > MAX_STANDARD_SHIPPING_RATE) {
        throw new Error(`standardShippingRate cannot exceed ${MAX_STANDARD_SHIPPING_RATE}.`);
      }
    } else if (args.key === "depositPercentages") {
      if (!args.value || typeof args.value !== "object" || Array.isArray(args.value)) {
        throw new Error("depositPercentages must be an object of non-negative percentages.");
      }
      for (const [name, percentage] of Object.entries(args.value)) {
        if (typeof percentage !== "number" || !Number.isFinite(percentage) || percentage < 0) {
          throw new Error(`depositPercentages.${name} must be a finite number greater than or equal to zero.`);
        }
      }
    } else if (args.key === "currency" && typeof args.value !== "string") {
      throw new Error("currency must be a string.");
    }

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: staff._id,
      });
    } else {
      await ctx.db.insert("settings", {
        key: args.key,
        value: args.value,
        updatedBy: staff._id,
      });
    }

    await ctx.runMutation(internal.adminLogs.logInternalAction, {
      userId: staff._id,
      adminName: staff.name || staff.email.split("@")[0],
      action: "Updated setting",
      category: "settings",
      details: JSON.stringify({ key: args.key, oldValue: existing?.value ?? null, newValue: args.value }),
    });

    return null;
  },
});
