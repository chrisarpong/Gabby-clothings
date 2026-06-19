import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkAdmin } from "./authHelper";


export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("contentBlocks")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    return block;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    let allBlocks = await ctx.db.query("contentBlocks").collect();

    const identity = await ctx.auth.getUserIdentity();
    let isAdmin = false;
    if (identity) {
      try {
        await checkAdmin(ctx, identity);
        isAdmin = true;
      } catch {
        isAdmin = false;
      }
    }

    if (!isAdmin) {
      allBlocks = allBlocks.filter(block => block.status === "published");
    }

    return allBlocks;
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    data: v.any(),
    status: v.optional(v.string()),
    seo: v.optional(
      v.object({
        metaTitle: v.optional(v.string()),
        metaDescription: v.optional(v.string()),
        ogImageId: v.optional(v.string()),
      })
    ),
    oldImageIdsToDelete: v.optional(v.array(v.string())), // for media cleanup
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    await checkAdmin(ctx, identity);

    // Media Cleanup
    if (args.oldImageIdsToDelete && args.oldImageIdsToDelete.length > 0) {
      for (const id of args.oldImageIdsToDelete) {
        try {
          await ctx.storage.delete(id as any);
        } catch (e) {
          console.error("Failed to delete old image:", id, e);
        }
      }
    }

    const existing = await ctx.db
      .query("contentBlocks")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
        status: args.status,
        seo: args.seo,
        updatedAt: Date.now(),
        updatedBy: identity.subject,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("contentBlocks", {
        key: args.key,
        data: args.data,
        status: args.status || "published",
        seo: args.seo,
        updatedAt: Date.now(),
        updatedBy: identity.subject,
      });
    }
  },
});
