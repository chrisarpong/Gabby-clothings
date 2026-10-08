import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { requireStaff } from "./staffAuth";

export const getNewsFlash = query({
  args: {},
  handler: async (ctx) => {
    // Return the latest active post with category "news_flash"
    return await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("category", "news_flash"))
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

export const createPost = mutation({
  args: {
      staffToken: v.string(),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    coverImageId: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "content" });
    return await ctx.db.insert("posts", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      coverImageId: args.coverImageId,
      category: args.category,
      status: args.status,
      authorId: staff._id,
    });
  },
});

export const updatePost = mutation({
  args: {
      staffToken: v.string(),
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImageId: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "content" });
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deletePost = mutation({
  args: {
      staffToken: v.string(),
    id: v.id("posts") },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "content" });
    return await ctx.db.delete(args.id);
  },
});
