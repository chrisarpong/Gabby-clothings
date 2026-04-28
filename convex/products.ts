import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";

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
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("products", args);
  },
});

// 5. Mutation for the Admin to update a product
export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    productInfo: v.optional(v.string()),
    returnPolicy: v.optional(v.string()),
    shippingInfo: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    type: v.optional(v.union(v.literal("custom"), v.literal("ready-to-wear"))),
    inStock: v.optional(v.boolean()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return { success: true };
  },
});

// 6. Mutation for the Admin to delete a product
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// 7. Search products by name
export const searchProducts = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm) {
      return [];
    }
    return await ctx.db
      .query("products")
      .withSearchIndex("search_name", (q) => q.search("name", args.searchTerm))
      .collect();
  },
});