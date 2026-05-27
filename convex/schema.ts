import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullBodyImageId: v.optional(v.string()),
    inspoImageId: v.optional(v.string()),
    role: v.string(), // 'admin' | 'client'
    savedMeasurements: v.optional(v.any()),
  }).index("by_clerkId", ["clerkId"]),

  products: defineTable({
    name: v.string(),
    basePrice: v.optional(v.number()),
    price: v.optional(v.number()),
    description: v.string(),
    images: v.array(v.string()),
    category: v.string(), 
    type: v.string(), // 'bespoke' | 'ready_to_wear'
    status: v.optional(v.string()), // 'active' | 'draft' | 'archived'
    inStock: v.optional(v.boolean()),
    productInfo: v.optional(v.string()),
    returnPolicy: v.optional(v.string()),
    shippingInfo: v.optional(v.string()),
    slug: v.optional(v.string()),
    stock: v.optional(v.number()),
    variants: v.optional(
      v.array(
        v.object({
          sku: v.string(),
          size: v.string(),
          color: v.string(),
          stock: v.number(),
          priceTotal: v.optional(v.number()), // For overriding base price
        })
      )
    ),
  }).index("by_category", ["category"]).index("by_status", ["status"]),

  orders: defineTable({
    userId: v.optional(v.string()), // clerkId
    customerDetails: v.optional(v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
    })),
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantSku: v.optional(v.string()), // to identify size/color
        quantity: v.number(),
        priceAtPurchase: v.optional(v.number()),
        priceAtTime: v.optional(v.number()),
        name: v.optional(v.string()),
        measurements: v.optional(v.any()), // Custom measurements for bespoke at time of order
      })
    ),
    subtotal: v.optional(v.number()),
    shippingFee: v.optional(v.number()),
    totalAmount: v.number(),
    status: v.string(), // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    paymentStatus: v.optional(v.string()), // 'pending', 'paid', 'failed'
    paystackReference: v.optional(v.string()),
    shippingAddress: v.optional(v.any()),
    trackingNumber: v.optional(v.string()),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedBy: v.optional(v.string()), // clerkId of admin
  }).index("by_key", ["key"]),

  appointments: defineTable({
    userId: v.optional(v.string()), // clerkId if logged in
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    garmentType: v.optional(v.string()), // 'suit', 'shirts', 'trousers', 'wedding'
    notes: v.optional(v.string()),
    status: v.string(), // 'pending', 'confirmed', 'completed', 'cancelled'
  }).index("by_userId", ["userId"]).index("by_status", ["status"]),

  reviews: defineTable({
    productId: v.id("products"),
    userId: v.string(),
    rating: v.number(),
    comment: v.string(),
    status: v.string(), // 'pending', 'approved', 'rejected'
  }).index("by_product", ["productId"]).index("by_status", ["status"]),

  subscribers: defineTable({
    email: v.string(),
    status: v.string(), // 'active', 'unsubscribed'
  }).index("by_email", ["email"]),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.string(), // 'unread', 'read', 'replied'
  }).index("by_status", ["status"]),

  promotions: defineTable({
    code: v.string(),
    discountType: v.string(), // 'percentage', 'fixed'
    discountValue: v.number(),
    validUntil: v.optional(v.number()), // timestamp
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  wishlists: defineTable({
    userId: v.string(),
    items: v.array(v.id("products")),
  }).index("by_userId", ["userId"]),
});
