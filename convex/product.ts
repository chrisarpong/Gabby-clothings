import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Query to fetch all products for the storefront
export const getProducts = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

// 2. Mutation for the Admin to add a new product
export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    description: v.string(),
    images: v.array(v.string()), // We will use simple image URLs for now
    type: v.union(v.literal("custom"), v.literal("ready-to-wear")),
    inStock: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});