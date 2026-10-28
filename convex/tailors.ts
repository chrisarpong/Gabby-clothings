import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireStaff } from "./staffAuth";

export const getAll = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "settings" });
    return await ctx.db.query("tailors").collect();
  },
});

export const listActiveTailors = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "settings" });
    return await ctx.db
      .query("tailors")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const addTailor = mutation({
  args: {
    staffToken: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "settings" });
    return await ctx.db.insert("tailors", {
      name: args.name,
      phone: args.phone,
      specialty: args.specialty,
      status: "active",
    });
  },
});

export const updateTailor = mutation({
  args: {
    staffToken: v.string(),
    id: v.id("tailors"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialty: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "settings" });
    const { staffToken, id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const removeTailor = mutation({
  args: {
    staffToken: v.string(),
    id: v.id("tailors"),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "settings" });
    await ctx.db.delete(args.id);
  },
});
