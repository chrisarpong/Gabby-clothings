import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const book = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    garmentType: v.string(),
  },
  handler: async (ctx, args) => {
    // Optionally we can require authentication to book an appointment
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) throw new Error("Unauthenticated");
    
    return await ctx.db.insert("appointments", {
      ...args,
      status: "pending",
    });
  },
});

export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.email !== "christiananietie10@gmail.com" && (identity as any).role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }
    // In a real app, perhaps filter by date >= today
    // For now, return all appointments to test admin dashboard
    return await ctx.db.query("appointments").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.email !== "christiananietie10@gmail.com" && (identity as any).role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }
    
    await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});
