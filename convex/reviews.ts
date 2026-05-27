import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    // Return all approved reviews for this product
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    // Map through reviews to include user info
    return Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", review.userId))
          .first();
        
        return {
          ...review,
          userFirstName: user?.firstName || "Anonymous",
          userLastName: user?.lastName || "",
        };
      })
    );
  },
});

export const addReview = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to leave a review");
    }

    const userId = identity.subject;

    // Optional: check if user already left a review for this product
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      throw new Error("You have already reviewed this product.");
    }

    await ctx.db.insert("reviews", {
      productId: args.productId,
      userId,
      rating: args.rating,
      comment: args.comment,
      status: "pending", // Reviews need approval
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    reviewId: v.id("reviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.patch(args.reviewId, { status: args.status });
  },
});

export const deleteReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.delete(args.reviewId);
  },
});
