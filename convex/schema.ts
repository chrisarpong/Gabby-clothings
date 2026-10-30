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
    role: v.string(), // 'client'
    roleId: v.optional(v.id("roles")),
    savedMeasurements: v.optional(v.any()),
    dob: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    country: v.optional(v.string()),
    address: v.optional(v.object({
      residentialAddress: v.string(),
      landmark: v.optional(v.string()),
      gps: v.optional(v.object({ lat: v.number(), lng: v.number() })),
      city: v.optional(v.string()),
      region: v.optional(v.string()),
    })),
  }).index("by_clerkId", ["clerkId"]),

  staff: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.string(), // 'ceo', 'admin', 'designer', 'sales'
    passwordHash: v.string(),
    passwordSalt: v.string(),
    mustChangePassword: v.boolean(),
    isActive: v.boolean(),
    failedAttempts: v.number(),
    lockedUntil: v.optional(v.number()),
    totpSecret: v.optional(v.string()),
    totpEnabled: v.boolean(),
    recoveryCodes: v.optional(v.string()), // hashed
    phone: v.optional(v.string()),
    phoneUpdatedAt: v.optional(v.number()),
    createdBy: v.optional(v.id("staff")),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]).index("by_role", ["role"]),

  staffSessions: defineTable({
    staffId: v.id("staff"),
    tokenHash: v.string(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
    expiresAt: v.number(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    revokedAt: v.optional(v.number()),
  }).index("by_tokenHash", ["tokenHash"]).index("by_staffId", ["staffId"]).index("by_expiresAt", ["expiresAt"]),

  devSmsOutbox: defineTable({
    phone: v.string(),
    message: v.string(),
    kind: v.string(),
    createdAt: v.number(),
  }).index("by_phone", ["phone"]).index("by_createdAt", ["createdAt"]),

  staffNotifications: defineTable({
    title: v.string(),
    type: v.string(),
    recipientRole: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number(),
    read: v.boolean(),
  }).index("by_type_createdAt", ["type", "createdAt"]).index("by_createdAt", ["createdAt"]),

  staffPasswordResets: defineTable({
    staffId: v.id("staff"),
    tempPasswordHash: v.string(),
    tempPasswordSalt: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    usedAt: v.optional(v.number()),
    voidedAt: v.optional(v.number()),
    createdAt: v.number(),
    via: v.string(), // "self_service" | "ceo"
  }).index("by_staffId", ["staffId"]).index("by_createdAt", ["createdAt"]),

  staffSmsLog: defineTable({
    purpose: v.string(), // "password_reset" | "password_changed"
    emailKey: v.string(), // SHA-256 of lowercase email
    staffId: v.optional(v.id("staff")),
    maskedPhone: v.optional(v.string()),
    outcome: v.string(), // "sent"|"blocked_rate_limit"|"blocked_daily_cap"|"disabled"|"no_account"|"no_phone"|"role_not_allowed"|"send_failed"
    via: v.string(), // "self_service" | "ceo"
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_emailKey_createdAt", ["emailKey", "createdAt"])
    .index("by_staffId_createdAt", ["staffId", "createdAt"])
    .index("by_maskedPhone_createdAt", ["maskedPhone", "createdAt"]),

  staffSecuritySettings: defineTable({
    smsResetEnabled: v.boolean(),
    smsResetAllowedRoles: v.array(v.string()),
    smsDailyCap: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("staff")),
  }),

  roles: defineTable({
    name: v.string(),
    label: v.string(),
    permissions: v.array(v.string()),
    isSystemRole: v.boolean(),
  }),

  products: defineTable({
    name: v.string(),
    sku: v.optional(v.string()),
    basePrice: v.number(),
    description: v.string(),
    images: v.array(v.string()),
    category: v.string(),
    type: v.string(), // 'ready_to_wear' or 'showcase_template'
    status: v.string(), // 'active', 'archived', 'draft'
    stock: v.optional(v.number()),
    fabricRequirement: v.optional(v.string()), // for showcase templates"
    slug: v.optional(v.string()),
    productInfo: v.optional(v.string()),
    shippingInfo: v.optional(v.string()),
    returnPolicy: v.optional(v.string()),
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
      phone: v.optional(v.string()),
    })),
    items: v.array(
      v.object({
        productId: v.optional(v.id("products")),
        variantSku: v.optional(v.string()), // to identify size/color
        quantity: v.number(),
        priceAtPurchase: v.optional(v.number()),
        priceAtTime: v.optional(v.number()),
        productName: v.optional(v.string()),
        name: v.optional(v.string()), // legacy field
        measurements: v.optional(v.any()), // Custom measurements for custom-fit at time of order
        notes: v.optional(v.string()),
        isCustomJob: v.optional(v.boolean()),
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
    paymentStatus: v.optional(v.string()), // 'pending', 'paid', 'failed', 'partial'
    paystackReference: v.optional(v.string()),
    shippingAddress: v.optional(v.any()),
    trackingNumber: v.optional(v.string()),

    // POS & Manual Order fields
    amountPaid: v.optional(v.number()),
    amountDue: v.optional(v.number()),
    isDeposit: v.optional(v.boolean()),
    depositRequired: v.optional(v.boolean()),
    depositPaid: v.optional(v.boolean()),
    paymentMethod: v.optional(v.string()), // 'paystack', 'cash', 'transfer', 'momo'
    createdByStaffId: v.optional(v.id("staff")),
    posIdempotencyKey: v.optional(v.string()),
    hasPriceAdjustment: v.optional(v.boolean()),
    
    // Assignment & Production
    // TODO(tighten): loosened to fit mock dev data
    assignedDesignerId: v.optional(v.union(v.id("staff"), v.string())),
    productionStatus: v.optional(v.string()), // 'cutting', 'stitching', 'fitting', 'finishing', 'completed'
  }).index("by_user", ["userId"]).index("by_status", ["status"]).index("by_paystackReference", ["paystackReference"]).index("by_assignedDesigner", ["assignedDesignerId"]).index("by_createdByStaff", ["createdByStaffId"]).index("by_posIdempotencyKey", ["posIdempotencyKey"]),

  checkoutSessions: defineTable({
    reference: v.string(),
    userId: v.string(), // Clerk identity subject
    customerDetails: v.object({ email: v.string(), firstName: v.string(), lastName: v.string() }),
    items: v.array(v.object({
      productId: v.id("products"),
      variantSku: v.optional(v.string()),
      quantity: v.number(),
      unitPesewas: v.number(),
      productName: v.string(),
      measurements: v.optional(v.any()),
    })),
    shippingAddress: v.object({
      street: v.string(), city: v.string(), region: v.string(), postalCode: v.string(), country: v.string(),
    }),
    promoCode: v.optional(v.string()),
    promoId: v.optional(v.id("promotions")),
    subtotalPesewas: v.number(),
    discountPesewas: v.number(),
    shippingPesewas: v.number(),
    expectedAmountPesewas: v.number(),
    currency: v.literal("GHS"),
    displayCurrency: v.optional(v.string()),
    rateAtOrderTime: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
    orderId: v.optional(v.id("orders")),
    createdAt: v.number(),
  }).index("by_reference", ["reference"]).index("by_userId", ["userId"]).index("by_status_createdAt", ["status", "createdAt"]),

  paymentIssues: defineTable({
    reference: v.optional(v.string()),
    kind: v.string(),
    details: v.string(),
    amountPesewas: v.optional(v.number()),
    relatedId: v.optional(v.string()),
    resolved: v.boolean(),
    createdAt: v.number(),
  }).index("by_resolved_createdAt", ["resolved", "createdAt"]).index("by_reference", ["reference"]),

  orderActivityLog: defineTable({
    orderId: v.id("orders"),
    stage: v.string(), // 'assigned', 'cutting', 'stitching', 'fitting', 'finishing', 'completed'
    // TODO(tighten): loosened to fit mock dev data
    performedBy: v.union(v.id("staff"), v.string()),
    note: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_order", ["orderId"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
    // TODO(tighten): loosened to fit mock dev data
    updatedBy: v.optional(v.union(v.id("staff"), v.string())),
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
    expectedAmountPesewas: v.optional(v.number()),
    paymentExpiresAt: v.optional(v.number()),
    cancelReason: v.optional(v.string()),
    confirmedAt: v.optional(v.number()),
    paystackReference: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
    meetLink: v.optional(v.string()),
    googleEventId: v.optional(v.string()), // ID from Google Calendar
    assignedTo: v.optional(v.string()), // ID or name of the assigned tailor
    assignedStaffId: v.optional(v.id("staff")),
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
  }).index("by_userId", ["userId"]).index("by_status", ["status"]).index("by_date", ["date"]).index("by_paystackReference", ["paystackReference"]).index("by_assignedStaff", ["assignedStaffId"]).index("by_paymentStatus_expiry", ["paymentStatus", "paymentExpiresAt"]),

  appointmentFiles: defineTable({
    storageId: v.id("_storage"),
    appointmentId: v.id("appointments"),
    ownerId: v.optional(v.string()),
  }).index("by_storageId", ["storageId"]).index("by_appointmentId", ["appointmentId"]),

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
  }).index("by_status", ["status"]).index("by_appointmentId", ["appointmentId"]),

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
    // TODO(tighten): loosened to fit mock dev data
    updatedBy: v.optional(v.union(v.id("staff"), v.string())),
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

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    orderId: v.optional(v.id("orders")),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

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
    // TODO(tighten): loosened to fit mock dev data
    authorId: v.optional(v.union(v.id("staff"), v.string())),
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
    // TODO(tighten): loosened to fit mock dev data
    userId: v.union(v.id("staff"), v.string(), v.null()),
    adminName: v.string(), // Extracted name of admin
    action: v.string(), // e.g. "Logged In", "Created Order"
    category: v.optional(v.string()), // e.g. "auth", "orders", "inventory", "settings", "content"
    details: v.optional(v.string()), // Any extra info
    targetId: v.optional(v.string()),    // ID of the affected record (orderId, productId, etc.)
    targetType: v.optional(v.string()),  // "order", "product", "setting", "appointment", etc.
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),   // raw UA string
    deviceName: v.optional(v.string()),  // parsed: "Chrome on macOS", "Safari on iPhone"
    timestamp: v.optional(v.number()), // Made optional for backwards compatibility with existing prod data
  }).index("by_userId", ["userId"]).index("by_category", ["category"]),

  tailors: defineTable({
    name: v.string(),
    phone: v.optional(v.string()),
    specialty: v.optional(v.string()),
    status: v.string(), // 'active', 'inactive'
  }).index("by_status", ["status"]),

  payments: defineTable({
    orderId: v.id("orders"),
    amount: v.number(),
    paymentMethod: v.string(),
    // TODO(tighten): loosened to fit mock dev data
    recordedBy: v.union(v.id("staff"), v.string()),
    notes: v.optional(v.string()),
    date: v.string(),
  }).index("by_orderId", ["orderId"]),

  staffLoginChallenges: defineTable({
    staffId: v.id("staff"),
    tokenHash: v.string(),
    purpose: v.union(v.literal("change_password"), v.literal("setup_2fa"), v.literal("verify_2fa")),
    expiresAt: v.number(),
    attempts: v.number(),
    usedAt: v.optional(v.number()),
  }).index("by_tokenHash", ["tokenHash"]),
});
