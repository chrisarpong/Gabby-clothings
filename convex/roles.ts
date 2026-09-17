import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./authHelper";

export const createRole = mutation({
  args: {
    name: v.string(),
    label: v.string(),
    permissions: v.array(v.string()),
    isSystemRole: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    // Check if role already exists
    const existing = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      throw new Error(`Role '${args.name}' already exists.`);
    }

    return await ctx.db.insert("roles", {
      name: args.name,
      label: args.label,
      permissions: args.permissions,
      isSystemRole: args.isSystemRole,
    });
  },
});

export const listRoles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    return await ctx.db.query("roles").collect();
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("roles"),
    label: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const removeRole = mutation({
  args: {
    id: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const role = await ctx.db.get(args.id);
    if (!role) throw new Error("Role not found");
    if (role.isSystemRole) {
      throw new Error("System roles cannot be deleted.");
    }

    await ctx.db.delete(args.id);
  },
});
