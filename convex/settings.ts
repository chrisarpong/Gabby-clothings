import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";

// Fetch the single store settings document
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("storeSettings").first();
  },
});

// Admin: Update or create store settings (upsert pattern)
export const updateSettings = mutation({
  args: {
    shippingRate: v.number(),
    taxPercentage: v.number(),
    announcementBannerText: v.string(),
    announcementBannerEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("storeSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("storeSettings", args);
    }
    return { success: true };
  },
});

// Admin: Fetch all admin users for team access
export const getAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").take(200);
    return users.filter((u) => u.role === "admin");
  },
});

// Admin: Revoke admin role (set back to customer)
export const revokeAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { role: "customer" });
    return { success: true };
  },
});
