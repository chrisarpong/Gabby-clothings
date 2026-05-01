import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";

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
      status: "approved", // Default to approved, can be moderated
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
      .filter((q) => q.neq(q.field("status"), "hidden"))
      .order("desc")
      .collect();
  },
});

export const getAllReviewsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const reviews = await ctx.db.query("reviews").order("desc").collect();
    
    // Enrich with product names
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const product = await ctx.db.get(review.productId);
        return {
          ...review,
          productName: product?.name || "Unknown Product",
        };
      })
    );
    
    return enrichedReviews;
  },
});

export const updateReviewStatus = mutation({
  args: {
    reviewId: v.id("reviews"),
    status: v.union(v.literal("approved"), v.literal("hidden")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.reviewId, { status: args.status });
    return { success: true };
  },
});

export const deleteReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.reviewId);
    return { success: true };
  },
});

