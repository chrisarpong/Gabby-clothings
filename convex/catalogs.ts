import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkAdmin } from "./authHelper";


export const getAll = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let catalogs = await ctx.db.query("catalogs").collect();
    if (!args.includeArchived) {
      catalogs = catalogs.filter((c) => c.status === "active");
    }
    return catalogs;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("catalogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.string()),
    status: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await checkAdmin(ctx, identity);

    // Check if slug exists
    const existing = await ctx.db
      .query("catalogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) throw new Error("Catalog with this slug already exists");

    return await ctx.db.insert("catalogs", {
      name: args.name,
      description: args.description,
      coverImageId: args.coverImageId,
      status: args.status,
      slug: args.slug,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("catalogs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.string()),
    status: v.optional(v.string()),
    slug: v.optional(v.string()),
    oldImageIdToDelete: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await checkAdmin(ctx, identity);

    // Delete old image if provided
    if (args.oldImageIdToDelete) {
      try {
        await ctx.storage.delete(args.oldImageIdToDelete as any);
      } catch (e) {
        console.error("Failed to delete old image:", args.oldImageIdToDelete, e);
      }
    }

    const { id, oldImageIdToDelete, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
