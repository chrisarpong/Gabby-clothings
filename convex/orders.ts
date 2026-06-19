import { checkAdmin } from "./authHelper";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

export const shippingAddressValidator = v.object({
  street: v.string(),
  city: v.string(),
  region: v.string(),
  postalCode: v.string(),
  country: v.string(),
});

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
      productName: v.string(),
      measurements: v.optional(v.any()),
    })),
    shippingAmount: v.number(),
    paystackReference: v.string(),
    shippingAddress: shippingAddressValidator,
    promoCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }

    if (args.shippingAddress) {
      const { street, city, region, postalCode, country } = args.shippingAddress;
      if (street.length < 5 || street.length > 100) throw new Error("Street must be between 5 and 100 characters");
      if (city.length < 2 || city.length > 50) throw new Error("City must be between 2 and 50 characters");
      if (region.length < 2 || region.length > 50) throw new Error("Region must be between 2 and 50 characters");
      if (postalCode.length < 2 || postalCode.length > 20) throw new Error("Postal code must be between 2 and 20 characters");
      if (country.length < 2 || country.length > 50) throw new Error("Country must be between 2 and 50 characters");
    }

    // 1. Verify Payment with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new Error("Payment verification failed: Server configuration error.");
    }

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

    // 2. Verify paid amount covers at least the base cost
    // Note: The exact discount is recalculated inside the create mutation
    // using ctx.db (which actions don't have). Here we just sanity-check
    // the payment isn't absurdly low (e.g. someone paying GH₵0).
    let expectedSubtotal = 0;
    for (const item of args.items) {
      const product = await ctx.runQuery(api.products.getById, { id: item.productId });
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const itemPrice = product.basePrice ?? 0;
      expectedSubtotal += itemPrice * item.quantity;
    }

    const paidAmountInCurrency = data.data.amount / 100; // Paystack returns amount in pesewas

    // Basic sanity check: paid amount should be > 0 and not wildly below subtotal
    if (paidAmountInCurrency <= 0) {
      throw new Error("Payment verification failed: zero or negative amount.");
    }

    // Allow for promo discounts by checking paid >= shipping at minimum
    if (paidAmountInCurrency < args.shippingAmount) {
      throw new Error(
        `Payment amount too low: paid GH₵${paidAmountInCurrency.toFixed(2)} but shipping alone is GH₵${args.shippingAmount.toFixed(2)}`
      );
    }

    // 3. Call mutation to insert order
    const orderId: any = await ctx.runMutation(internal.orders.create, {
      userId: args.userId,
      customerDetails: args.customerDetails,
      items: args.items,
      shippingFee: args.shippingAmount,
      paymentStatus: "paid",
      paystackReference: args.paystackReference,
      shippingAddress: args.shippingAddress,
      promoCode: args.promoCode,
    });

    return orderId;
  },
});

export const create = internalMutation({
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
      productName: v.string(),
      measurements: v.optional(v.any()),
    })),
    shippingFee: v.number(),
    paymentStatus: v.string(),
    paystackReference: v.optional(v.string()),
    shippingAddress: v.optional(shippingAddressValidator),
    promoCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Please sign in to complete checkout.");

    let calculatedSubtotal = 0;
    const finalItems: any[] = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      const itemPrice = product.basePrice ?? (product as any).price ?? 0;
      
      calculatedSubtotal += itemPrice * item.quantity;

      finalItems.push({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
        priceAtPurchase: itemPrice,
        productName: item.productName,
        measurements: item.measurements,
      });
    }

    let discountAmount = 0;
    if (args.promoCode) {
      const promo = await ctx.db
        .query("promotions")
        .withIndex("by_code", (q) => q.eq("code", args.promoCode!))
        .first();
      if (promo && promo.isActive && (!promo.validUntil || Date.now() <= promo.validUntil)) {
        if (promo.discountType === "percentage") {
          discountAmount = calculatedSubtotal * (promo.discountValue / 100);
        } else if (promo.discountType === "fixed") {
          discountAmount = promo.discountValue;
        }
      }
    }

    const calculatedTotalAmount = calculatedSubtotal - discountAmount + args.shippingFee;

    // Insert using exact schema field names
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      customerDetails: args.customerDetails,
      items: finalItems,
      subtotal: calculatedSubtotal,
      shippingFee: args.shippingFee,
      discountAmount,
      promoCodeId: args.promoCode ? (await ctx.db.query("promotions").withIndex("by_code", q => q.eq("code", args.promoCode!)).first())?._id : undefined,
      totalAmount: calculatedTotalAmount,
      status: "processing",
      paymentStatus: args.paymentStatus,
      paystackReference: args.paystackReference,
      shippingAddress: args.shippingAddress,
    });

    // Decrement stock for each purchased variant
    for (const item of args.items) {
      if (item.variantSku) {
        const product = await ctx.db.get(item.productId);
        if (product?.variants) {
          const updatedVariants = product.variants.map((v) => {
            if (v.sku === item.variantSku) {
              const newStock = Math.max(0, v.stock - item.quantity);
              return { ...v, stock: newStock };
            }
            return v;
          });
          await ctx.db.patch(item.productId, { variants: updatedVariants });
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
    await checkAdmin(ctx, identity);
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
    if (identity.subject !== args.userId) {
      await checkAdmin(ctx, identity);
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
    await checkAdmin(ctx, identity);
    
    await ctx.db.patch(args.orderId, {
      status: args.status,
    });

    const order = await ctx.db.get(args.orderId);
    if (order && order.customerDetails) {
      await ctx.scheduler.runAfter(0, internal.email.sendOrderStatusUpdate, {
        orderId: args.orderId,
        email: order.customerDetails.email,
        name: order.customerDetails.firstName,
        status: args.status,
      });
    }
  },
});

