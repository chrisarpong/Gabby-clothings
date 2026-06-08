import { checkAdmin } from "./authHelper";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.query("users").collect();
  },
});

export const getAllEmails = query({
  args: {},
  handler: async (ctx) => {
    // Used by internal actions to get mailing list
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({ email: u.email, name: u.firstName || "Valued Client" })).filter(u => u.email);
  }
});

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.clerkId) {
      await checkAdmin(ctx, identity);
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName ?? existingUser.firstName,
        lastName: args.lastName ?? existingUser.lastName,
        role: args.role ?? existingUser.role,
      });
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role ?? "client",
    });
  },
});

export const updateMeasurements = mutation({
  args: {
    clerkId: v.string(),
    measurements: v.object({
      chest: v.optional(v.number()),
      waist: v.optional(v.number()),
      hips: v.optional(v.number()),
      inseam: v.optional(v.number()),
      shoulders: v.optional(v.number()),
      height: v.optional(v.number()),
      weight: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.clerkId) {
      await checkAdmin(ctx, identity);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, {
      savedMeasurements: { ...user.savedMeasurements, ...args.measurements },
    });
  },
});

export const getMeasurements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user?.savedMeasurements || null;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const makeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    // For development/initial setup: allow the first user to become admin, 
    // or allow anyone to become admin if there are NO admins yet.
    const admins = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "admin")).collect();
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User record not synced yet. Try logging out and back in.");

    if (admins.length > 0 && user.role !== "admin") {
       throw new Error("An admin already exists. You cannot make yourself admin.");
    }

    await ctx.db.patch(user._id, { role: "admin" });
    return "You are now an admin!";
  }
});
