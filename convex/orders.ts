
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireStaff } from "./staffAuth";
import { nextOrderNumber } from "./lib/orderNumber";
import { checkAvailability, apply } from "./lib/stock";
import { lineUnitPrice, toPesewas } from "./lib/pricing";
import { generatePaymentReference, verifyPaystackTransaction } from "./lib/paystack";

export const shippingAddressValidator = v.object({
  street: v.string(),
  city: v.string(),
  region: v.string(),
  postalCode: v.string(),
  country: v.string(),
});

/* Removed legacy client-priced checkout action and internal creator in Phase 3 D2.
const verifyAndCreate = ({
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

    const orderId = await nextOrderNumber(ctx);

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

*/
export const getAll = query({
  args: {
      staffToken: v.string()
},
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "orders" });
    return await ctx.db.query("orders").collect();
  },
});

export const getUserOrders = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }
    // Specific user can see their own
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getMyOrderByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const order = await ctx.db.query("orders")
      .withIndex("by_paystackReference", q => q.eq("paystackReference", args.reference))
      .first();
    return order && order.userId === identity.subject ? order : null;
  },
});

export const updateStatus = mutation({
  args: {
      staffToken: v.string(),
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "orders" });
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

export const getByIdInternal = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => await ctx.db.get(args.orderId),
});

export const createPOSOrder = mutation({
  args: {
    staffToken: v.string(),
    userId: v.optional(v.string()),
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
      name: v.optional(v.string()),
      unitPriceOverride: v.optional(v.number()),
      overrideReason: v.optional(v.string()),
      measurements: v.optional(v.any()),
      notes: v.optional(v.string()),
    })),
    payInFull: v.boolean(),
    amountPaid: v.optional(v.number()),
    paymentMethod: v.union(v.literal("cash"), v.literal("momo"), v.literal("transfer")),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: ["sales_portal", "orders"] });
    if (!args.idempotencyKey.trim()) throw new Error("idempotencyKey is required.");
    const existing = await ctx.db.query("orders").withIndex("by_posIdempotencyKey", q => q.eq("posIdempotencyKey", args.idempotencyKey)).first();
    if (existing) {
      if (existing.createdByStaffId !== staff._id) throw new Error("This sale key belongs to another staff member.");
      return existing._id;
    }
    if (args.items.length < 1 || args.items.length > 30) throw new Error("A POS sale must contain 1 to 30 items.");
    if (args.userId) {
      const customer = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", args.userId!)).first();
      if (!customer) throw new Error("Customer account not found.");
    }
    const tracked: Array<{ productId: any; variantSku?: string; quantity: number }> = [];
    const finalItems: any[] = [];
    let totalPesewas = 0;
    for (const item of args.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) throw new Error("Quantity must be an integer from 1 to 50.");
      if (item.overrideReason && item.overrideReason.length > 200) throw new Error("Override reason is too long.");
      if (!item.productId) {
        const name = item.name?.trim() || "";
        if (name.length < 1 || name.length > 100) throw new Error("Custom job name must be 1 to 100 characters.");
        if (item.unitPriceOverride === undefined || !Number.isFinite(item.unitPriceOverride) || item.unitPriceOverride < 0.01 || item.unitPriceOverride > 1_000_000) throw new Error("Custom job price must be between 0.01 and 1,000,000 GHS.");
        const pricePesewas = toPesewas(item.unitPriceOverride);
        totalPesewas += pricePesewas * item.quantity;
        finalItems.push({ name, productName: name, quantity: item.quantity, priceAtPurchase: item.unitPriceOverride, measurements: item.measurements, notes: item.notes, isCustomJob: true });
        await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Created POS custom job", details: JSON.stringify({ name, price: item.unitPriceOverride, quantity: item.quantity }), category: "orders", timestamp: Date.now() });
        continue;
      }
      const product = await ctx.db.get(item.productId);
      if (!product || product.status !== "active") throw new Error("A POS product is unavailable.");
      const basePesewas = lineUnitPrice(product, item.variantSku);
      let pricePesewas = basePesewas;
      if (item.unitPriceOverride !== undefined) {
        if (!Number.isFinite(item.unitPriceOverride) || item.unitPriceOverride < 0 || item.unitPriceOverride > 1_000_000) throw new Error("Price override is outside the allowed range.");
        pricePesewas = toPesewas(item.unitPriceOverride);
        const minimum = staff.role === "sales" ? Math.ceil(basePesewas * 0.8) : 0;
        if (pricePesewas < minimum || (staff.role === "sales" && pricePesewas > basePesewas)) throw new Error("Sales price overrides must be between 80% and 100% of catalogue price.");
        await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "POS price override", details: JSON.stringify({ item: product.name, original: basePesewas / 100, price: pricePesewas / 100, reason: item.overrideReason }), category: "orders", timestamp: Date.now() });
      }
      const variantSku = item.variantSku?.trim() === "" ? undefined : item.variantSku;
      if (variantSku !== undefined && variantSku !== "custom") tracked.push({ productId: item.productId, variantSku, quantity: item.quantity });
      totalPesewas += pricePesewas * item.quantity;
      finalItems.push({ productId: item.productId, variantSku, quantity: item.quantity, priceAtPurchase: pricePesewas / 100, productName: product.name, measurements: item.measurements, notes: item.notes });
    }
    const shortages = await checkAvailability(ctx, tracked, {});
    if (shortages.length > 0) throw new Error(`Insufficient stock for ${shortages.map(row => `${row.productName} (${row.variantSku})`).join(", ")}.`);
    const totalAmount = totalPesewas / 100;
    let amountPaid = args.payInFull ? totalAmount : (args.amountPaid ?? 0);
    if (!Number.isFinite(amountPaid) || amountPaid < 0 || amountPaid > totalAmount) throw new Error("Payment amount must be between zero and the total.");
    if (!args.payInFull && amountPaid === 0 && staff.role !== "ceo" && staff.role !== "admin") throw new Error("Sales must collect a positive deposit.");
    if (args.payInFull) amountPaid = totalAmount;
    if (!args.payInFull && amountPaid > 0 && amountPaid >= totalAmount) throw new Error("A deposit must be less than the total; use pay in full.");
    const applied = await apply(ctx, tracked);
    if (applied.length) throw new Error("Stock changed while this POS order was being prepared. Please retry.");
    const amountDue = totalAmount - amountPaid;
    const orderId = await ctx.db.insert("orders", {
      orderId: await nextOrderNumber(ctx), userId: args.userId || "guest", createdByStaffId: staff._id,
      customerDetails: args.customerDetails, items: finalItems, subtotal: totalAmount, shippingFee: 0, discountAmount: 0,
      totalAmount, status: "processing", paymentStatus: amountPaid === 0 ? "pending" : amountDue > 0 ? "partial" : "paid",
      paystackReference: `manual_${generatePaymentReference()}`, amountPaid, amountDue, isDeposit: amountDue > 0,
      paymentMethod: args.paymentMethod, posIdempotencyKey: args.idempotencyKey,
    });
    if (amountPaid > 0) await ctx.db.insert("payments", { orderId, amount: amountPaid, paymentMethod: args.paymentMethod, recordedBy: staff._id, notes: "Initial POS order payment", date: new Date().toISOString() });
    return orderId;
  }
});

export const getMySales = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "sales_portal" });
    if (staff.role === "sales") {
      return await ctx.db.query("orders")
        .withIndex("by_createdByStaff", q => q.eq("createdByStaffId", staff._id))
        .order("desc")
        .take(200);
    }
    return await ctx.db.query("orders").order("desc").take(200);
  },
});

export const recordDeposit = mutation({
  args: {
    staffToken: v.string(),
    orderId: v.id("orders"),
    amountPaid: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("momo"), v.literal("transfer")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "orders" });
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === "cancelled") throw new Error("Cancelled orders cannot receive payments.");
    if (!Number.isFinite(args.amountPaid) || args.amountPaid <= 0) throw new Error("Payment amount must be positive.");
    const currentDue = Math.max(0, order.amountDue ?? ((order.totalAmount || 0) - (order.amountPaid || 0)));
    if (args.amountPaid > currentDue) throw new Error("Payment cannot exceed the amount due.");
    const newAmountPaid = (order.amountPaid || 0) + args.amountPaid;
    const amountDue = (order.totalAmount || 0) - newAmountPaid;
    
    let paymentStatus = "pending";
    if (newAmountPaid > 0 && amountDue > 0) paymentStatus = "partial";
    if (amountDue <= 0) paymentStatus = "paid";

    await ctx.db.patch(args.orderId, {
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, amountDue),
      paymentStatus: paymentStatus,
      isDeposit: amountDue > 0,
    });

    await ctx.db.insert("payments", {
      orderId: args.orderId,
      amount: args.amountPaid,
      paymentMethod: args.paymentMethod,
      recordedBy: staff._id,
      notes: args.notes || "Manual order payment",
      date: new Date().toISOString(),
    });
    await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Recorded manual order payment", details: JSON.stringify({ orderId: args.orderId, amount: args.amountPaid, method: args.paymentMethod }), category: "financials", timestamp: Date.now() });
  }
});

export const assignDesigner = mutation({
  args: {
      staffToken: v.string(),
    orderId: v.id("orders"),
    designerId: v.union(v.id("staff"), v.null()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "orders" });
    const designer = args.designerId ? await ctx.db.get(args.designerId) : null;
    if (args.designerId && (!designer || designer.role !== "designer" || !designer.isActive)) {
      throw new Error("Assigned staff member must be an active designer.");
    }

    await ctx.db.patch(args.orderId, {
      assignedDesignerId: args.designerId ?? undefined,
    });

    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: designer ? "assigned" : "unassigned",
      performedBy: staff._id,
      note: args.note || (designer ? `Assigned to ${designer.name}` : "Designer assignment cleared"),
      timestamp: Date.now(),
    });

    await ctx.db.insert("adminLogs", {
      action: `Assigned designer to order`,
      category: "orders",
      targetId: args.orderId,
      targetType: "order",
      timestamp: Date.now(),
      userId: staff._id,
      adminName: staff.name || "Admin",
    });
  }
});

export const updateProductionStatus = mutation({
  args: {
      staffToken: v.string(),
    orderId: v.id("orders"),
    status: v.string(), // 'cutting', 'stitching', 'fitting', 'finishing', 'completed'
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "orders" });

    await ctx.db.patch(args.orderId, {
      productionStatus: args.status,
    });

    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: args.status,
      performedBy: staff._id,
      note: args.note || `Production status updated to ${args.status}`,
      timestamp: Date.now(),
    });

    await ctx.db.insert("adminLogs", {
      action: `Updated production status to ${args.status}`,
      category: "orders",
      targetId: args.orderId,
      targetType: "order",
      timestamp: Date.now(),
      userId: staff._id,
      adminName: staff.name || "Admin",
    });

    if (args.status === 'completed' || args.status === 'ready_for_pickup') {
      const order = await ctx.db.get(args.orderId);
      if (order && order.userId) {
        const customer = order.userId ? await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", order.userId!)).first() : null;
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
      staffToken: v.string(),
    orderId: v.id("orders"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "orders" });
    const order = await ctx.db.get(args.orderId);
    if (!order || !order.userId) throw new Error("Order or customer not found");

    const customer = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", order.userId!)).first();
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

    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: order.productionStatus || "pending",
      performedBy: staff._id,
      note: `Sent manual notification to client: ${args.message}`,
      timestamp: Date.now(),
    });
  }
});
