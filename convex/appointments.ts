import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Submit a new Appointment Booking
export const bookAppointment = mutation({
  args: {
    date: v.string(),
    time: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if the user is authenticated (Optional, allowing guests)
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.tokenIdentifier;

    return await ctx.db.insert("appointments", {
      userId: userId,
      date: args.date,
      time: args.time,
      name: args.name,
      email: args.email,
      phone: args.phone,
      notes: args.notes,
      status: "pending",
    });
  },
});

// 2. Admin Query: Fetch all appointments
export const getAppointmentsAdmin = query({
  args: {},
  handler: async (ctx) => {
    // In the future, wrap this in an isAdmin check!
    return await ctx.db.query("appointments").order("desc").collect();
  },
});

// 3. User Query: Fetch only their own appointments (if logged in)
export const getMyAppointments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.tokenIdentifier;

    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
