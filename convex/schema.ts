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
    dob: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    country: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  products: defineTable({
    name: v.string(),
    basePrice: v.number(),
    description: v.string(),
    images: v.array(v.string()),
    category: v.string(),
    type: v.string(), // 'ready_to_wear' or 'showcase_template'
    status: v.string(), // 'active', 'archived', 'draft'
    stock: v.optional(v.number()),
    fabricRequirement: v.optional(v.string()), // for showcase templates"
    slug: v.optional(v.string()),
    catalogIds: v.optional(v.array(v.id("catalogs"))),
    seo: v.optional(v.object({
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
    })),
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
  }).index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_category_status", ["category", "status"]),

  orders: defineTable({
    orderId: v.optional(v.string()), // e.g. "GB-1"
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
        productName: v.optional(v.string()),
        name: v.optional(v.string()), // legacy field
        measurements: v.optional(v.any()), // Custom measurements for bespoke at time of order
      })
    ),
    subtotal: v.optional(v.number()),
    shippingFee: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    promoCodeId: v.optional(v.id("promotions")),
    
    // Old field kept for compatibility
    totalAmount: v.number(), 
    
    // New multi-currency billing fields
    baseTotalAmount: v.optional(v.number()), 
    chargedCurrency: v.optional(v.string()), 
    chargedAmount: v.optional(v.number()), 
    rateAtOrderTime: v.optional(v.number()), 
    gatewayUsed: v.optional(v.string()), 
    displayCurrency: v.optional(v.string()),

    status: v.string(), // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    paymentStatus: v.optional(v.string()), // 'pending', 'paid', 'failed'
    paystackReference: v.optional(v.string()),
    shippingAddress: v.optional(v.any()),
    trackingNumber: v.optional(v.string()),
  }).index("by_user", ["userId"]).index("by_status", ["status"]).index("by_paystackReference", ["paystackReference"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedBy: v.optional(v.string()), // clerkId of admin
  }).index("by_key", ["key"]),

  exchangeRates: defineTable({
    currency: v.string(), // e.g. 'USD'
    liveRate: v.number(), // The live GHS -> Currency rate
    manualRate: v.optional(v.number()), // Admin override
    manualRateExpiry: v.optional(v.number()), // timestamp
    lastUpdated: v.number(), // timestamp of last live fetch
  }).index("by_currency", ["currency"]),

  appointments: defineTable({
    userId: v.optional(v.string()), // clerkId if logged in
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    garmentType: v.optional(v.string()), // 'suit', 'shirts', 'trousers', 'wedding', 'consultation'
    notes: v.optional(v.string()),
    status: v.string(), // 'pending', 'confirmed', 'completed', 'cancelled'
    paymentStatus: v.optional(v.string()), // 'pending', 'paid'
    paystackReference: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
    meetLink: v.optional(v.string()),
    googleEventId: v.optional(v.string()), // ID from Google Calendar
    assignedTo: v.optional(v.string()), // ID or name of the assigned tailor
    referenceImages: v.optional(v.array(v.id("_storage"))),
    appointmentType: v.optional(v.string()), // 'Virtual Consultation', 'In-Person Measurement', 'First Fitting', 'Final Fitting'
    linkedOrderId: v.optional(v.id("orders")),
    fabricAndStyling: v.optional(v.any()), // JSON object for fabrics, color codes, button preferences
    adminNotes: v.optional(v.string()), // Tailor notes
    measurementsCaptured: v.optional(v.boolean()),
    occasionType: v.optional(v.string()), // 'Wedding', 'Funeral', 'Graduation', etc
    targetEventDate: v.optional(v.string()), // Actual event date for triage
    ghanaPostGps: v.optional(v.string()),
    landmarks: v.optional(v.string()),
  }).index("by_userId", ["userId"]).index("by_status", ["status"]).index("by_date", ["date"]).index("by_paystackReference", ["paystackReference"]),

  reviews: defineTable({
    productId: v.id("products"),
    userId: v.string(),
    rating: v.number(),
    comment: v.string(),
    status: v.string(), // 'pending', 'approved', 'rejected'
    isVerifiedPurchase: v.optional(v.boolean()),
  }).index("by_product", ["productId"]).index("by_status", ["status"]),

  subscribers: defineTable({
    email: v.string(),
    status: v.string(), // 'active', 'unsubscribed'
  }).index("by_email", ["email"]),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
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
    maxRedemptions: v.optional(v.number()),
    redemptions: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
  }).index("by_code", ["code"]),

  wishlists: defineTable({
    userId: v.string(),
    items: v.array(v.id("products")),
  }).index("by_userId", ["userId"]),

  reminders: defineTable({
    appointmentId: v.id("appointments"),
    scheduledFor: v.string(), // ISO date
    status: v.string(), // 'pending', 'sent'
    type: v.string(), // '24h_reminder'
  }).index("by_status", ["status"]),

  contentBlocks: defineTable({
    key: v.string(), // e.g., "home_hero", "faq_items", "legal_privacy"
    data: v.any(), // Flexible JSON payload containing text, array lists, or image storage IDs
    status: v.optional(v.string()), // 'draft' | 'published'
    seo: v.optional(v.object({
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
      ogImageId: v.optional(v.string()),
    })),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.string()), // clerkId of admin
  }).index("by_key", ["key"]),

  catalogs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.string()), // Optional image for the catalog
    status: v.string(), // 'active', 'archived'
    slug: v.string(), // URL friendly name
  }).index("by_slug", ["slug"]).index("by_status", ["status"]),

  rateLimits: defineTable({
    identifier: v.string(),
    endpoint: v.string(),
    count: v.number(),
    lastAttempt: v.number(),
  }).index("by_identifier_endpoint", ["identifier", "endpoint"]),

  carts: defineTable({
    userId: v.string(), // clerkId
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantSku: v.optional(v.string()),
        quantity: v.number(),
      })
    ),
  }).index("by_userId", ["userId"]),

  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(), // Markdown/Rich text
    excerpt: v.optional(v.string()),
    coverImageId: v.optional(v.string()),
    authorId: v.optional(v.string()), // clerkId
    status: v.string(), // 'draft' | 'published'
    publishedAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  }).index("by_slug", ["slug"]).index("by_status", ["status"]).index("by_category", ["category"]),

  activeCheckouts: defineTable({
    userId: v.string(), // clerkId or session ID
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantSku: v.optional(v.string()),
        quantity: v.number(),
      })
    ),
    expiresAt: v.number(), // timestamp
  }).index("by_userId", ["userId"]),

  adminLogs: defineTable({
    userId: v.string(), // clerkId of the admin
    adminName: v.string(), // Extracted name of admin
    action: v.string(), // e.g. "Logged In", "Created Order"
    details: v.optional(v.string()), // Any extra info
  }).index("by_userId", ["userId"]),
});
