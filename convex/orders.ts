import { checkAdmin } from "./authHelper";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
    baseTotalAmount: v.optional(v.number()),
    chargedCurrency: v.optional(v.string()),
    chargedAmount: v.optional(v.number()),
    rateAtOrderTime: v.optional(v.number()),
    displayCurrency: v.optional(v.string()),
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
    if (!data.status || data.data?.status !== "success") {
      throw new Error(`Payment verification failed: ${data.message || "Transaction not successful"}`);
    }

    // 2. Calculate the expected total server-side and verify against paid amount
    let expectedSubtotal = 0;
    for (const item of args.items) {
      const product = await ctx.runQuery(api.products.getById, { id: item.productId });
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const itemPrice = product.basePrice ?? 0;
      expectedSubtotal += itemPrice * item.quantity;
    }

    // Calculate promo discount server-side
    let promoDiscount = 0;
    if (args.promoCode) {
      const promoResult = await ctx.runQuery(api.promotions.getPromoByCode, { code: args.promoCode });
      if (
        promoResult && 
        promoResult.isActive && 
        (!promoResult.validUntil || Date.now() <= promoResult.validUntil) &&
        (!promoResult.minOrderAmount || expectedSubtotal >= promoResult.minOrderAmount) &&
        (!promoResult.maxRedemptions || (promoResult.redemptions || 0) < promoResult.maxRedemptions)
      ) {
        if (promoResult.discountType === "percentage") {
          promoDiscount = expectedSubtotal * (promoResult.discountValue / 100);
        } else if (promoResult.discountType === "fixed") {
          promoDiscount = promoResult.discountValue;
        }
      }
    }

    const expectedTotal = expectedSubtotal - promoDiscount + args.shippingAmount;
    const paidAmountInCurrency = data.data.amount / 100; // Paystack returns amount in pesewas

    if (paidAmountInCurrency <= 0) {
      throw new Error("Payment verification failed: zero or negative amount.");
    }

    // Strict verification: paid amount must be within 1% of expected total (tolerance for rounding)
    if (paidAmountInCurrency < expectedTotal * 0.99) {
      throw new Error(
        `Payment amount mismatch: paid GH₵${paidAmountInCurrency.toFixed(2)} but expected GH₵${expectedTotal.toFixed(2)}`
      );
    }

    // Duplicate order prevention: query DB to check if an order with this paystackReference already exists
    const existingOrder = await ctx.runQuery(internal.orders.getByPaystackReference, { paystackReference: args.paystackReference });
    if (existingOrder) {
      throw new Error("Payment already processed. Order already exists for this transaction.");
    }

    // 3. Call mutation to insert order (includes duplicate check)
    const orderId: any = await ctx.runMutation(internal.orders.create, {
      userId: args.userId,
      customerDetails: args.customerDetails,
      items: args.items,
      shippingFee: args.shippingAmount,
      paymentStatus: "paid",
      paystackReference: args.paystackReference,
      shippingAddress: args.shippingAddress,
      promoCode: args.promoCode,
      baseTotalAmount: args.baseTotalAmount,
      chargedCurrency: args.chargedCurrency,
      chargedAmount: args.chargedAmount,
      rateAtOrderTime: args.rateAtOrderTime,
      displayCurrency: args.displayCurrency,
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
    baseTotalAmount: v.optional(v.number()),
    chargedCurrency: v.optional(v.string()),
    chargedAmount: v.optional(v.number()),
    rateAtOrderTime: v.optional(v.number()),
    displayCurrency: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Duplicate order prevention: check if an order with this reference already exists
    if (args.paystackReference) {
      const existingOrder = await ctx.db
        .query("orders")
        .withIndex("by_paystackReference", (q) => q.eq("paystackReference", args.paystackReference))
        .first();
      if (existingOrder) {
        return existingOrder._id; // Idempotent: return the existing order
      }
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Please sign in to complete checkout.");

    let calculatedSubtotal = 0;
    let calculatedDepositAmount = 0;
    const finalItems: any[] = [];

    const depositPercentagesSetting = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "depositPercentages")).first();
    const depositPercentages = depositPercentagesSetting?.value || { suiting: 70, kaftans: 100, readyToWear: 100 };

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      const itemPrice = product.basePrice ?? (product as any).price ?? 0;
      
      calculatedSubtotal += itemPrice * item.quantity;
      
      let itemDepositPercent = 100;
      const cat = (product.category || "").toLowerCase();
      if (cat.includes("suit")) itemDepositPercent = depositPercentages.suiting ?? 70;
      else if (cat.includes("kaftan")) itemDepositPercent = depositPercentages.kaftans ?? 100;
      else itemDepositPercent = depositPercentages.readyToWear ?? 100;
      
      calculatedDepositAmount += (itemPrice * item.quantity) * (itemDepositPercent / 100);

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
      if (
        promo && 
        promo.isActive && 
        (!promo.validUntil || Date.now() <= promo.validUntil) &&
        (!promo.minOrderAmount || calculatedSubtotal >= promo.minOrderAmount) &&
        (!promo.maxRedemptions || (promo.redemptions || 0) < promo.maxRedemptions)
      ) {
        if (promo.discountType === "percentage") {
          discountAmount = calculatedSubtotal * (promo.discountValue / 100);
        } else if (promo.discountType === "fixed") {
          discountAmount = promo.discountValue;
        }
        await ctx.db.patch(promo._id, { redemptions: (promo.redemptions || 0) + 1 });
      }
    }

    const calculatedTotalAmount = calculatedSubtotal - discountAmount + args.shippingFee;

    // Atomic sequential order ID generation
    let orderCounter = 1;
    const counterSetting = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "orderCounter")).first();
    if (counterSetting) {
      orderCounter = (counterSetting.value as number) + 1;
      await ctx.db.patch(counterSetting._id, { value: orderCounter });
    } else {
      await ctx.db.insert("settings", { key: "orderCounter", value: orderCounter });
    }
    const orderId = `GB-${String(orderCounter).padStart(3, '0')}`;

    // Insert using exact schema field names
    const newOrderId = await ctx.db.insert("orders", {
      orderId,
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
      baseTotalAmount: args.baseTotalAmount,
      chargedCurrency: args.chargedCurrency,
      chargedAmount: args.chargedAmount,
      rateAtOrderTime: args.rateAtOrderTime,
      displayCurrency: args.displayCurrency,
      amountDue: Math.max(0, calculatedTotalAmount - (args.amountPaid || 0)),
      amountPaid: args.amountPaid || 0,
      depositRequired: calculatedDepositAmount > 0 && calculatedDepositAmount < calculatedTotalAmount,
    });

    // Decrement stock for each purchased variant and clear active reserve
    for (const item of args.items) {
      if (item.variantSku === "custom") continue;
      const product = await ctx.db.get(item.productId);
      if (product) {
        if (product.variants && product.variants.length > 0) {
          const updatedVariants = product.variants.map((v) => {
            if (v.sku === item.variantSku) {
              return { ...v, stock: Math.max(0, v.stock - item.quantity) };
            }
            return v;
          });
          await ctx.db.patch(item.productId, { variants: updatedVariants });
        } else if (product.stock !== undefined) {
          await ctx.db.patch(item.productId, { stock: Math.max(0, product.stock - item.quantity) });
        }
      }
    }

    // Clear active checkouts for this user
    const reserves = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const res of reserves) {
      await ctx.db.delete(res._id);
    }

    // Send order confirmation email
    if (args.customerDetails?.email) {
      await ctx.scheduler.runAfter(0, internal.email.sendOrderConfirmation, {
        orderId: newOrderId,
        email: args.customerDetails.email,
        name: args.customerDetails.firstName,
        amount: calculatedTotalAmount,
      });
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

export const getByPaystackReference = internalQuery({
  args: { paystackReference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_paystackReference", (q) => q.eq("paystackReference", args.paystackReference))
      .first();
  },
});

export const createPOSOrder = mutation({
  args: {
    userId: v.optional(v.string()), // Optional clerkId if they have an account
    customerDetails: v.object({
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      phone: v.optional(v.string()),
    }),
    items: v.array(v.object({
      productId: v.optional(v.id("products")),
      variantSku: v.optional(v.string()),
      quantity: v.number(),
      productName: v.string(),
      price: v.number(), // The overridden or base price
      measurements: v.optional(v.any()), // custom-fit measurements taken in shop
    })),
    shippingFee: v.number(),
    amountPaid: v.number(),
    amountDue: v.number(),
    isDeposit: v.boolean(),
    paymentMethod: v.string(), // 'cash', 'momo', 'transfer', 'paystack'
    paystackReference: v.optional(v.string()), // Required if paymentMethod is 'paystack'
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    // If it's a paystack MoMo/Card payment, verify it first
    if (args.paymentMethod === 'paystack' && args.paystackReference) {
      // Duplicate order prevention
      const existingOrder = await ctx.db
        .query("orders")
        .withIndex("by_paystackReference", (q) => q.eq("paystackReference", args.paystackReference!))
        .first();
      if (existingOrder) {
        return existingOrder._id;
      }

      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecret) throw new Error("Payment verification failed: Server configuration error.");

      const resp = await fetch(`https://api.paystack.co/transaction/verify/${args.paystackReference}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${paystackSecret}` },
      });
      const data = await resp.json();
      if (!data.status || data.data?.status !== "success") {
        throw new Error(`Payment verification failed: ${data.message || "Transaction not successful"}`);
      }
    }

    let subtotal = 0;
    for (const item of args.items) {
      subtotal += item.price * item.quantity;
    }

    const totalAmount = subtotal + args.shippingFee;

    // Atomic sequential order ID generation
    let orderCounter = 1;
    const counterSetting = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "orderCounter")).first();
    if (counterSetting) {
      orderCounter = (counterSetting.value as number) + 1;
      await ctx.db.patch(counterSetting._id, { value: orderCounter });
    } else {
      await ctx.db.insert("settings", { key: "orderCounter", value: orderCounter });
    }
    const orderIdValue = `GB-${String(orderCounter).padStart(3, '0')}`;
    if (counterSetting) {
        await ctx.db.patch(counterSetting._id, { value: orderCounter.toString() });
    }

    let paymentStatus = "pending";
    if (args.amountPaid > 0) {
      paymentStatus = args.isDeposit ? "partial" : "paid";
    }

    const orderId = await ctx.db.insert("orders", {
      orderId: orderIdValue,
      userId: args.userId || "guest",
      customerDetails: args.customerDetails,
      items: args.items.map(item => ({
         productId: item.productId,
         variantSku: item.variantSku,
         quantity: item.quantity,
         priceAtPurchase: item.price,
         productName: item.productName,
         measurements: item.measurements,
      })),
      subtotal: subtotal,
      shippingFee: args.shippingFee,
      discountAmount: 0,
      totalAmount: totalAmount,
      status: "processing", // In POS, usually instantly in process
      paymentStatus: paymentStatus,
      paystackReference: args.paystackReference || `manual_${Date.now()}`,
      amountPaid: args.amountPaid,
      amountDue: args.amountDue,
      isDeposit: args.isDeposit,
      paymentMethod: args.paymentMethod,
    });

    if (args.amountPaid > 0) {
      await ctx.db.insert("payments", {
        orderId,
        amount: args.amountPaid,
        paymentMethod: args.paymentMethod,
        recordedBy: identity.subject,
        notes: `Initial POS order payment`,
        date: new Date().toISOString(),
      });
    }

    return orderId;
  }
});

export const recordDeposit = mutation({
  args: {
    orderId: v.id("orders"),
    amountPaid: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const newAmountPaid = (order.amountPaid || 0) + args.amountPaid;
    const amountDue = (order.totalAmount || 0) - newAmountPaid;
    
    let paymentStatus = "pending";
    if (newAmountPaid > 0 && amountDue > 0) paymentStatus = "partial";
    if (amountDue <= 0) paymentStatus = "paid";

    await ctx.db.patch(args.orderId, {
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, amountDue),
      paymentStatus: paymentStatus,
      paystackReference: args.paystackReference,
      isDeposit: true, // Mark that a deposit was made
    });

    await ctx.db.insert("payments", {
      orderId: args.orderId,
      amount: args.amountPaid,
      paymentMethod: "paystack",
      recordedBy: identity.subject,
      notes: `Deposit payment via Paystack (${args.paystackReference})`,
      date: new Date().toISOString(),
    });
  }
});

export const assignDesigner = mutation({
  args: {
    orderId: v.id("orders"),
    designerId: v.id("users"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).first();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.orderId, {
      assignedDesignerId: args.designerId,
    });

    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: "assigned",
      performedBy: user._id,
      note: args.note || "Assigned to designer",
      timestamp: Date.now(),
    });

    await ctx.db.insert("adminLogs", {
      action: `Assigned designer to order`,
      category: "orders",
      targetId: args.orderId,
      targetType: "order",
      timestamp: Date.now(),
      adminId: identity.subject,
    });
  }
});

export const updateProductionStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(), // 'cutting', 'stitching', 'fitting', 'finishing', 'completed'
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).first();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.orderId, {
      productionStatus: args.status,
    });

    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: args.status,
      performedBy: user._id,
      note: args.note || `Production status updated to ${args.status}`,
      timestamp: Date.now(),
    });

    await ctx.db.insert("adminLogs", {
      action: `Updated production status to ${args.status}`,
      category: "orders",
      targetId: args.orderId,
      targetType: "order",
      timestamp: Date.now(),
      adminId: identity.subject,
    });

    if (args.status === 'completed' || args.status === 'ready_for_pickup') {
      const order = await ctx.db.get(args.orderId);
      if (order && order.userId) {
        const customer = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", order.userId)).first();
        if (customer) {
          await ctx.db.insert("notifications", {
            userId: customer._id,
            type: "order_update",
            title: `Order ${args.status === 'completed' ? 'Completed' : 'Ready'}`,
            body: `Your order ${order.orderId || order._id.substring(0, 8)} is now ${args.status.replace('_', ' ')}.`,
            orderId: order._id,
            read: false,
            createdAt: Date.now(),
          });
          
          if (customer.phone) {
            await ctx.scheduler.runAfter(0, internal.sms.sendSms, {
              phoneNumber: customer.phone,
              message: `Hi ${customer.firstName}, your Gabby Clothings order ${order.orderId || order._id.substring(0, 8)} is now ${args.status.replace('_', ' ')}. Thank you!`,
            });
          }
        }
      }
    }
  }
});

export const notifyClient = mutation({
  args: {
    orderId: v.id("orders"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const order = await ctx.db.get(args.orderId);
    if (!order || !order.userId) throw new Error("Order or customer not found");

    const customer = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", order.userId)).first();
    if (!customer) throw new Error("Customer not found");

    await ctx.db.insert("notifications", {
      userId: customer._id,
      type: "admin_message",
      title: "Update from Gabby Clothings",
      body: args.message,
      orderId: order._id,
      read: false,
      createdAt: Date.now(),
    });

    if (customer.phone) {
      await ctx.scheduler.runAfter(0, internal.sms.sendSms, {
        phoneNumber: customer.phone,
        message: args.message,
      });
    }

    const adminUser = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", identity.subject)).first();
    
    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: order.productionStatus || "pending",
      performedBy: adminUser?._id || ("unknown" as any),
      note: `Sent manual notification to client: ${args.message}`,
      timestamp: Date.now(),
    });
  }
});
