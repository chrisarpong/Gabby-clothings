import { checkAdmin } from "./authHelper";
import { mutation, query, internalQuery } from "./_generated/server";
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

export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId)).first();
  }
});

export const getAllEmails = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

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
    measurements: v.any(),
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

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    dob: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    country: v.optional(v.string()),
    address: v.optional(v.object({
      residentialAddress: v.string(),
      landmark: v.optional(v.string()),
      gps: v.optional(v.object({ lat: v.number(), lng: v.number() })),
      city: v.optional(v.string()),
      region: v.optional(v.string()),
    })),
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
      dob: args.dob ?? user.dob,
      phone: args.phone ?? user.phone,
      whatsapp: args.whatsapp ?? user.whatsapp,
      country: args.country ?? user.country,
      address: args.address ?? user.address,
    });
  },
});

// NOTE: Admin provisioning is done directly via the Convex Dashboard.
// Go to Data → users table → find your user → set role to "admin" or "superadmin".
// There is no callable mutation for this to prevent privilege escalation.

export const createClientFromAppointment = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const [firstName, ...lastNameParts] = args.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const userId = await ctx.db.insert("users", {
      clerkId: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      email: args.email,
      firstName: firstName,
      lastName: lastName,
      phone: args.phone,
      role: "client",
    });

    return userId;
  }
});

export const createStaffUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const [firstName, ...lastNameParts] = args.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const userId = await ctx.db.insert("users", {
      clerkId: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      email: args.email,
      firstName: firstName,
      lastName: lastName,
      phone: args.phone,
      role: "staff", 
      roleId: args.roleId,
    });

    await ctx.db.insert("adminLogs", {
      action: `Created staff user: ${args.name}`,
      category: "team",
      targetId: userId,
      targetType: "user",
      timestamp: Date.now(),
      adminId: identity.subject,
    });

    return userId;
  }
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    await ctx.db.patch(args.userId, {
      roleId: args.roleId,
      role: "staff",
    });

    await ctx.db.insert("adminLogs", {
      action: `Updated role for user`,
      category: "team",
      targetId: args.userId,
      targetType: "user",
      timestamp: Date.now(),
      adminId: identity.subject,
    });
  }
});

export const listStaffUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const users = await ctx.db.query("users").collect();
    
    // In memory filter for staff members (anyone with a roleId or role that isn't 'client')
    return users.filter(u => u.roleId !== undefined || (u.role && u.role !== 'client'));
  }
});
