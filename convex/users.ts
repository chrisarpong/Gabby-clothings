import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// ─── ADMIN SECURITY HELPER ──────────────────────────────────────────────
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call. You must be logged in.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required.");
  }

  return user;
}
// ────────────────────────────────────────────────────────────────────────

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!existingUser) {
      // 1. BRAND NEW USER: Insert with "customer" role
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: "customer",
      });
    }
    
    // 2. EXISTING USER: Update basic info if it changed in Clerk
    await ctx.db.patch(existingUser._id, {
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
    });

    return existingUser._id;
  },
});

export const getUserProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

export const getMeasurementProfiles = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("measurementProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const updateMeasurements = mutation({
  args: {
    profileName: v.optional(v.string()),
    height: v.optional(v.number()),
    chest: v.optional(v.number()),
    waist: v.optional(v.number()),
    hips: v.optional(v.number()),
    shoulders: v.optional(v.number()),
    sleeveLength: v.optional(v.number()),
    inseam: v.optional(v.number()),
    neck: v.optional(v.number()),
    thigh: v.optional(v.number()),
    fullBodyImageId: v.optional(v.id("_storage")),
    inspoImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to save measurements.");
    }

    const pName = args.profileName || "Primary Profile";

    const existingProfile = await ctx.db
      .query("measurementProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("profileName"), pName))
      .first();

    const data = {
      height: args.height,
      chest: args.chest,
      waist: args.waist,
      hips: args.hips,
      shoulders: args.shoulders,
      sleeveLength: args.sleeveLength,
      inseam: args.inseam,
      neck: args.neck,
      thigh: args.thigh,
      fullBodyImageId: args.fullBodyImageId,
      inspoImageId: args.inspoImageId,
    };

    Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, data);
    } else {
      await ctx.db.insert("measurementProfiles", {
        userId: identity.subject,
        profileName: pName,
        ...data,
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (user && pName === "Primary Profile") {
      const measurementData = { ...data };
      delete measurementData.fullBodyImageId;
      delete measurementData.inspoImageId;
      
      await ctx.db.patch(user._id, {
        savedMeasurements: { ...user.savedMeasurements, ...measurementData },
        fullBodyImageId: args.fullBodyImageId ?? user.fullBodyImageId,
        inspoImageId: args.inspoImageId ?? user.inspoImageId,
      });
    }

    return { success: true };
  },
});

export const getAllClients = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "customer"))
      .collect();
  },
});

export const getMeasurementProfilesAdmin = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("measurementProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});