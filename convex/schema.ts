import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define standard male measurements to reuse
const measurementFields = {
  neck: v.optional(v.number()),
  chest: v.optional(v.number()),
  waist: v.optional(v.number()),
  hips: v.optional(v.number()),
  shoulderToWaist: v.optional(v.number()),
  sleeveLength: v.optional(v.number()),
  inseam: v.optional(v.number()),
  thigh: v.optional(v.number()),
};

export default defineSchema({
  // 1. USERS TABLE
  users: defineTable({
    clerkId: v.string(), // Links to their Clerk Authentication
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    // Saved to profile for future orders
    savedMeasurements: v.optional(v.object(measurementFields)), 
  }).index("by_clerk_id", ["clerkId"]),

  // 2. PRODUCTS TABLE
  products: defineTable({
    name: v.string(),
    price: v.number(),
    description: v.string(),
    images: v.array(v.string()),
    type: v.union(v.literal("custom"), v.literal("ready-to-wear")),
    inStock: v.boolean(),
  }),

  // 3. ORDERS TABLE
  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      priceAtTime: v.number(),
      type: v.union(v.literal("custom"), v.literal("ready-to-wear")),
    })),
    totalAmount: v.number(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("shipped"), v.literal("completed")),
    
    // THE BESPOKE BUSINESS LOGIC
    tailoringDetails: v.optional(v.object({
      hasMeasurements: v.boolean(), // True = Option A, False = Option B
      measurementsUsed: v.optional(v.object(measurementFields)), // Snapshot for this specific order
      fullBodyImageId: v.id("_storage"), // COMPULSORY Convex storage ID
      inspoImageId: v.optional(v.id("_storage")), // OPTIONAL Convex storage ID
    })),
    
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      region: v.string(),
      country: v.string(),
    }),
  }),
});