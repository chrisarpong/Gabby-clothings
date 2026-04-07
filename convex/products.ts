import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Query to fetch all products for the storefront
export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").take(100);
  },
});

// 2. Query to fetch a single product by its ID
export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// 3. Query to fetch products by category
export const getProductsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .take(50);
  },
});

// 4. Mutation for the Admin to add a new product
export const createProduct = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    price: v.number(),
    description: v.string(),
    productInfo: v.optional(v.string()),
    returnPolicy: v.optional(v.string()),
    shippingInfo: v.optional(v.string()),
    images: v.array(v.string()),
    category: v.optional(v.string()),
    type: v.union(v.literal("custom"), v.literal("ready-to-wear")),
    inStock: v.boolean(),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});