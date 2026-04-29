import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addReview = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to leave a review.");
    }

    const userName = identity.name || "Verified Client";

    await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: identity.subject,
      userName: userName,
      rating: args.rating,
      comment: args.comment,
    });

    return { success: true };
  },
});

export const getProductReviews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});
