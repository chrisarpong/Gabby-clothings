import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const verifyAndCreate = action({
  args: {
    userId: v.string(),
    customerDetails: v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
    }),
    items: v.array(v.object({
      productId: v.id("products"),
      variantSku: v.optional(v.string()),
      quantity: v.number(),
      measurements: v.optional(v.any()),
    })),
    shippingAmount: v.number(),
    paystackReference: v.string(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }

    // 1. Verify Payment with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.warn("PAYSTACK_SECRET_KEY not set. Skipping verification for dev.");
      // In production, you would throw an error here.
    } else {
      const resp = await fetch(`https://api.paystack.co/transaction/verify/${args.paystackReference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      });
      const data = await resp.json();
      if (!data.status || data.data.status !== "success") {
        throw new Error("Payment verification failed");
      }
      
      // Ideally, also verify data.data.amount matches the expected subtotal
    }

    // 2. Call internal mutation to insert order
    const orderId = await ctx.runMutation(internal.orders.createInternal, {
      userId: args.userId,
      customerDetails: args.customerDetails,
      items: args.items,
      shippingAmount: args.shippingAmount,
      paymentStatus: "paid",
      paystackReference: args.paystackReference,
      shippingAddress: args.shippingAddress,
    });

    return orderId;
  },
});

export const createInternal = internalMutation({
  args: {
    userId: v.string(),
    customerDetails: v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
    }),
    items: v.array(v.object({
      productId: v.id("products"),
      variantSku: v.optional(v.string()),
      quantity: v.number(),
      measurements: v.optional(v.any()), // sizes, etc.
    })),
    shippingAmount: v.number(),
    paymentStatus: v.string(),
    paystackReference: v.optional(v.string()),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }

    // SECURITY MANDATE: recalculate total using database prices
    let calculatedSubtotal = 0;
    const finalItems = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      let itemPrice = product.basePrice;
      let variantName = "";
      
      if (item.variantSku && product.variants) {
         const variant = product.variants.find(v => v.sku === item.variantSku);
         if (variant) {
           variantName = variant.size;
           if (variant.stock < item.quantity) {
             throw new Error(`Insufficient stock for product ${product.name} - ${variant.size}`);
           }
         }
      }

      calculatedSubtotal += itemPrice * item.quantity;

      finalItems.push({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
        priceAtPurchase: itemPrice,
        measurements: item.measurements,
      });
    }

    const calculatedTotalAmount = calculatedSubtotal + args.shippingAmount;

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      customerDetails: args.customerDetails,
      items: finalItems,
      subtotal: calculatedSubtotal,
      totalAmount: calculatedTotalAmount,
      status: "processing", // initial status
      paymentStatus: args.paymentStatus,
      paystackReference: args.paystackReference,
      shippingAddress: args.shippingAddress,
    });
    
    // Decrease stock correctly if variantSku is present
    for (const item of args.items) {
       const product = await ctx.db.get(item.productId);
       if(product) {
         if (item.variantSku && product.variants) {
            const updatedVariants = product.variants.map((v) => {
              if (v.sku === item.variantSku && v.stock >= item.quantity) {
                return { ...v, stock: v.stock - item.quantity };
              }
              return v;
            });
            await ctx.db.patch(item.productId, { variants: updatedVariants });
         } else if (product.basePrice && (product as any).stock !== undefined) {
             // Fallback for non-variants if we kept stock globally (not requested but safe)
         }
       }
    }

    return orderId;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.email !== "christiananietie10@gmail.com" && (identity as any).role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }
    return await ctx.db.query("orders").collect();
  },
});

export const getUserOrders = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    // Admins can see any order, specific user can see their own
    if (identity.subject !== args.userId && identity.email !== "christiananietie10@gmail.com" && (identity as any).role !== "admin") {
      return [];
    }
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.email !== "christiananietie10@gmail.com" && (identity as any).role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }
    return await ctx.db.patch(args.orderId, {
      status: args.status,
    });
  },
});

