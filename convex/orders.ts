
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireStaff } from "./staffAuth";
import { nextOrderNumber } from "./lib/orderNumber";
import { checkAvailability, apply } from "./lib/stock";
import { lineUnitPrice, toPesewas, moneyToPesewas } from "./lib/pricing";
import { generatePaymentReference, verifyPaystackTransaction } from "./lib/paystack";

const moneyPesewas = moneyToPesewas;

export const shippingAddressValidator = v.object({
  street: v.string(),
  city: v.string(),
  region: v.string(),
  postalCode: v.string(),
  country: v.string(),
});


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
    const allowed = ["pending", "processing", "fabric_sourced", "cutting_phase", "first_fitting_ready", "final_adjustments", "ready_for_pickup", "dispatched", "shipped", "completed", "delivered", "on_hold", "cancelled"];
    if (!allowed.includes(args.status)) throw new Error("Invalid order status.");
    await ctx.db.patch(args.orderId, {
      status: args.status,
    });

    const order = await ctx.db.get(args.orderId);
    if (args.status === "on_hold") {
      await ctx.db.insert("orderActivityLog", { orderId: args.orderId, stage: "on_hold", performedBy: staff._id, note: "Order placed on hold", timestamp: Date.now() });
    }
    if (args.status !== "on_hold" && order && order.customerDetails) {
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
    let hasPriceAdjustment = false;
    for (const item of args.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) throw new Error("Quantity must be an integer from 1 to 50.");
      if (item.overrideReason && item.overrideReason.length > 200) throw new Error("Override reason is too long.");
      if (!item.productId) {
        const name = item.name?.trim() || "";
        if (name.length < 1 || name.length > 100) throw new Error("Custom job name must be 1 to 100 characters.");
        if (item.unitPriceOverride === undefined || !Number.isFinite(item.unitPriceOverride) || item.unitPriceOverride < 0.01 || item.unitPriceOverride > 1_000_000) throw new Error("Custom job price must be between 0.01 and 1,000,000 GHS.");
        const pricePesewas = moneyPesewas(item.unitPriceOverride, "Custom job price");
        totalPesewas += pricePesewas * item.quantity;
        finalItems.push({ name, productName: name, quantity: item.quantity, priceAtPurchase: item.unitPriceOverride, measurements: item.measurements, notes: item.notes, isCustomJob: true });
        if (staff.role === "sales") hasPriceAdjustment = true;
        await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Created POS custom job", details: JSON.stringify({ name, price: item.unitPriceOverride, quantity: item.quantity }), category: "orders", timestamp: Date.now() });
        continue;
      }
      const product = await ctx.db.get(item.productId);
      if (!product || product.status !== "active") throw new Error("A POS product is unavailable.");
      const requestedSku = item.variantSku?.trim() === "" ? undefined : item.variantSku;
      const madeToMeasure = product.type === "showcase_template" || requestedSku === "custom";
      if (product.variants?.length && requestedSku === undefined && !madeToMeasure) throw new Error(`Please choose a size for ${product.name}.`);
      const effectiveSku = madeToMeasure ? "custom" : (product.variants?.length ? requestedSku : product.sku);
      if (!product.variants?.length && effectiveSku === undefined) throw new Error(`${product.name} needs a product SKU.`);
      const basePesewas = lineUnitPrice(product, effectiveSku);
      let pricePesewas = basePesewas;
      if (item.unitPriceOverride !== undefined) {
        if (!Number.isFinite(item.unitPriceOverride) || item.unitPriceOverride < 0 || item.unitPriceOverride > 1_000_000) throw new Error("Price override is outside the allowed range.");
        pricePesewas = moneyPesewas(item.unitPriceOverride, "Price override");
        if (staff.role === "sales" || pricePesewas < basePesewas) hasPriceAdjustment = true;
        const minimum = staff.role === "sales" ? Math.ceil(basePesewas * 0.8) : 0;
        if (pricePesewas < minimum || (staff.role === "sales" && pricePesewas > basePesewas)) throw new Error("Sales price overrides must be between 80% and 100% of catalogue price.");
        await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "POS price override", details: JSON.stringify({ item: product.name, original: basePesewas / 100, price: pricePesewas / 100, reason: item.overrideReason }), category: "orders", timestamp: Date.now() });
      }
      const variantSku = effectiveSku;
      if (!madeToMeasure && variantSku !== undefined) tracked.push({ productId: item.productId, variantSku, quantity: item.quantity });
      totalPesewas += pricePesewas * item.quantity;
      finalItems.push({ productId: item.productId, variantSku, quantity: item.quantity, priceAtPurchase: pricePesewas / 100, productName: product.name, measurements: item.measurements, notes: item.notes });
    }
    const shortages = await checkAvailability(ctx, tracked, {});
    if (shortages.length > 0) throw new Error(`Insufficient stock for ${shortages.map(row => `${row.productName} (${row.variantSku})`).join(", ")}.`);
    const totalAmount = totalPesewas / 100;
    let amountPaidPesewas = args.payInFull ? totalPesewas : moneyPesewas(args.amountPaid ?? 0, "Payment amount");
    if (amountPaidPesewas < 0 || amountPaidPesewas > totalPesewas) throw new Error("Payment amount must be between zero and the total.");
    let amountPaid = amountPaidPesewas / 100;
    if (!args.payInFull && amountPaid === 0 && staff.role !== "ceo" && staff.role !== "admin") throw new Error("Sales must collect a positive deposit.");
    if (args.payInFull) amountPaid = totalAmount;
    if (!args.payInFull && amountPaid > 0 && amountPaid >= totalAmount) throw new Error("A deposit must be less than the total; use pay in full.");
    const applied = await apply(ctx, tracked);
    if (applied.length) throw new Error("Stock changed while this POS order was being prepared. Please retry.");
    const amountDue = (totalPesewas - amountPaidPesewas) / 100;
    const orderId = await ctx.db.insert("orders", {
      orderId: await nextOrderNumber(ctx), userId: args.userId || "guest", createdByStaffId: staff._id,
      customerDetails: args.customerDetails, items: finalItems, subtotal: totalAmount, shippingFee: 0, discountAmount: 0,
      totalAmount, status: "processing", paymentStatus: amountPaid === 0 ? "pending" : amountDue > 0 ? "partial" : "paid",
      paystackReference: `manual_${generatePaymentReference()}`, amountPaid, amountDue, isDeposit: amountDue > 0,
      paymentMethod: args.paymentMethod, posIdempotencyKey: args.idempotencyKey,
      hasPriceAdjustment,
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

export const recordManualPayment = mutation({
  args: {
    staffToken: v.string(),
    orderId: v.id("orders"),
    amount: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("momo"), v.literal("transfer")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (staff.role === "designer") throw new Error("Designers cannot record payments.");
    if (staff.role === "sales" && order.createdByStaffId !== staff._id) throw new Error("Sales may only record payments for their own orders.");
    if (order.status === "cancelled") throw new Error("Cancelled orders cannot receive payments.");
    const amountPaid = moneyPesewas(args.amount, "Payment amount");
    if (amountPaid <= 0) throw new Error("Payment amount must be positive.");
    const currentDue = Math.max(0, order.amountDue ?? ((order.totalAmount || 0) - (order.amountPaid || 0)));
    if (amountPaid > Math.round(currentDue * 100)) throw new Error("Payment cannot exceed the amount due.");
    const newAmountPaid = (Math.round((order.amountPaid || 0) * 100) + amountPaid) / 100;
    const amountDue = (Math.round((order.totalAmount || 0) * 100) - Math.round(newAmountPaid * 100)) / 100;
    
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
      amount: amountPaid / 100,
      paymentMethod: args.paymentMethod,
      recordedBy: staff._id,
      notes: args.notes || "Manual order payment",
      date: new Date().toISOString(),
    });
    await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Recorded manual order payment", details: JSON.stringify({ orderId: args.orderId, amount: amountPaid / 100, method: args.paymentMethod }), category: "financials", timestamp: Date.now() });
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

