import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./authHelper";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    return await ctx.db.query("tailors").collect();
  },
});

export const listActiveTailors = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    return await ctx.db
      .query("tailors")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const addTailor = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

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
    id: v.id("tailors"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialty: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const removeTailor = mutation({
  args: {
    id: v.id("tailors"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    await ctx.db.delete(args.id);
  },
});
