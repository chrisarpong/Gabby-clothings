import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check if this user already exists in the database
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // 2. If they are new, insert them into the database
    if (!existingUser) {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: "customer",
      });
    }
    
    // 3. If they exist, just return their ID
    return existingUser._id;
  },
});

// Fetch the current user's profile and measurements
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

// Fetch all measurement profiles for the current user (Catalogue)
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

// Update or create a measurement profile in the catalogue
export const updateMeasurements = mutation({
  args: {
    profileName: v.optional(v.string()), // Added for the catalogue
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

    // Default legacy support (if they update from the current profile view without a name)
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

    // Clean undefined fields to avoid overriding existing saved dimensions with undefined
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

    // Optional legacy sync to users table temporarily for backwards compatibility
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
