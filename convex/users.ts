import { requireStaff } from "./staffAuth";
import { mutation, query, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { hasPermission, StaffRole } from "./staffPermissions";

export const getAll = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "dashboard" });
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
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "marketing" });

    // Used by internal actions to get mailing list
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({ email: u.email, name: u.firstName || "Valued Client" })).filter(u => u.email);
  }
});

export const syncUser = mutation({
  args: {
    clerkId: v.optional(v.string()),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
    roleId: v.optional(v.string()),
    staffToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let targetClerkId: string;

    if (args.staffToken) {
      await requireStaff(ctx, args.staffToken, { permission: "dashboard" });
      if (!args.clerkId) {
        throw new ConvexError("clerkId is required when syncing user via staffToken");
      }
      targetClerkId = args.clerkId;
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Unauthenticated: Must be logged in to sync user");
      }
      targetClerkId = identity.subject;
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", targetClerkId))
      .first();

    if (existingUser) {
      return await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName ?? existingUser.firstName,
        lastName: args.lastName ?? existingUser.lastName,
        // Role cannot be modified or escalated via syncUser
      });
    }

    return await ctx.db.insert("users", {
      clerkId: targetClerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: "client", // Always 'client'
    });
  },
});

export const updateMeasurements = mutation({
  args: {
    clerkId: v.string(),
    measurements: v.any(),
    staffToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.staffToken) {
      const staff = await requireStaff(ctx, args.staffToken);
      if (!hasPermission(staff.role as StaffRole, "designer_portal") && !hasPermission(staff.role as StaffRole, "orders")) {
        throw new ConvexError({ code: "FORBIDDEN", message: "Unauthorized: Requires orders or designer_portal permission" });
      }
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Unauthenticated: Must be logged in");
      }
      if (identity.subject !== args.clerkId) {
        throw new ConvexError("Forbidden: Cannot update another user's measurements");
      }
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
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
    staffToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.staffToken) {
      await requireStaff(ctx, args.staffToken, { permission: "dashboard" });
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Unauthenticated: Must be logged in");
      }
      if (identity.subject !== args.clerkId) {
        throw new ConvexError("Forbidden: Cannot update another user's profile");
      }
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
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
    staffToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "appointments" });

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


