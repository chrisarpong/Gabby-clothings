import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define standard male measurements to reuse
const measurementFields = {
  height: v.optional(v.number()),
  neck: v.optional(v.number()),
  chest: v.optional(v.number()),
  waist: v.optional(v.number()),
  hips: v.optional(v.number()),
  shoulders: v.optional(v.number()),
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
    savedMeasurements: v.optional(v.object(measurementFields)),
    fullBodyImageId: v.optional(v.id("_storage")),
    inspoImageId: v.optional(v.id("_storage")),
    role: v.optional(v.union(v.literal("admin"), v.literal("customer"))),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // 1.5 MEASUREMENT PROFILES (Catalogue)
  measurementProfiles: defineTable({
    userId: v.string(), // Links to their Clerk Authentication
    profileName: v.string(),
    ...measurementFields,
    fullBodyImageId: v.optional(v.id("_storage")),
    inspoImageId: v.optional(v.id("_storage")),
  }).index("by_userId", ["userId"]),

  // 2. PRODUCTS TABLE
  products: defineTable({
    name: v.string(),
    slug: v.optional(v.string()),
    price: v.number(),
    description: v.string(),
    productInfo: v.optional(v.string()),
    returnPolicy: v.optional(v.string()),
    shippingInfo: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    images: v.array(v.string()),
    category: v.optional(v.string()),
    type: v.union(v.literal("custom"), v.literal("ready-to-wear")),
    inStock: v.boolean(),
    stock: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .searchIndex("search_name", { searchField: "name" }),

  // 3. CART ITEMS TABLE (server-side cart for authenticated users)
  cartItems: defineTable({
    userId: v.string(), // Clerk user ID (tokenIdentifier)
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  // 4. ORDERS TABLE
  orders: defineTable({
    userId: v.optional(v.string()), // Optional for guests, Clerk tokenIdentifier for logged in users
    paystackReference: v.string(), // Transaction reference from Paystack
    items: v.array(
      v.object({
        productId: v.string(), // Product ID as string for flexibility
        name: v.string(),
        quantity: v.number(),
        priceAtTime: v.number(),
      })
    ),
    totalAmount: v.number(),
    shippingFee: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("completed"),
      v.literal("cancelled")
    ),

    // THE BESPOKE BUSINESS LOGIC (handled separately after order)
    tailoringDetails: v.optional(
      v.object({
        hasMeasurements: v.boolean(),
        measurementsUsed: v.optional(v.object(measurementFields)),
        fullBodyImageId: v.optional(v.id("_storage")),
        inspoImageId: v.optional(v.id("_storage")),
      })
    ),

    shippingAddress: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      region: v.string(),
      country: v.optional(v.string()),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_reference", ["paystackReference"]),

  // 5. APPOINTMENTS TABLE
  appointments: defineTable({
    userId: v.optional(v.string()), // Guest or logged-in user
    date: v.string(),
    time: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"]),

  // 6. WISHLISTS TABLE
  wishlists: defineTable({
    userId: v.string(), // Clerk tokenIdentifier
    productId: v.id("products"),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_product", ["userId", "productId"]),

  // 7. NEWSLETTER TABLE
  newsletter: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
  }).index("by_email", ["email"]),

  // 8. REVIEWS TABLE
  reviews: defineTable({
    productId: v.id("products"),
    userId: v.string(),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
    status: v.optional(v.union(v.literal("approved"), v.literal("hidden"))),
  }).index("by_product", ["productId"]),

  // 9. CONTACT MESSAGES TABLE
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.string(),
  }),

  // 10. PROMO CODES TABLE
  promoCodes: defineTable({
    code: v.string(),
    discountPercentage: v.number(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  // 11. STORE SETTINGS TABLE (single-document)
  storeSettings: defineTable({
    shippingRate: v.number(),
    taxPercentage: v.number(),
    announcementBannerText: v.string(),
    announcementBannerEnabled: v.boolean(),
  }),
});