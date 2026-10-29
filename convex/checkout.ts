import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { computeTotals, fromPesewas, lineUnitPrice, mergeAndValidateCartLines, toPesewas } from "./lib/pricing";
import { checkAvailability, apply } from "./lib/stock";
import { generatePaymentReference, verifyPaystackTransaction } from "./lib/paystack";
import { nextOrderNumber } from "./lib/orderNumber";

const customerDetailsValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
});

const shippingAddressValidator = v.object({
  street: v.string(),
  city: v.string(),
  region: v.string(),
  postalCode: v.string(),
  country: v.string(),
});

const checkoutItemsValidator = v.array(v.object({
  productId: v.id("products"),
  variantSku: v.optional(v.string()),
  quantity: v.number(),
  measurements: v.optional(v.any()),
}));

const SUPPORTED_DISPLAY_CURRENCIES = ["GHS", "USD", "GBP", "EUR", "ZAR", "NGN", "CAD", "AUD", "JPY", "AED"];

function validateShippingAddress(address: { street: string; city: string; region: string; postalCode: string; country: string }) {
  if (address.street.length < 5 || address.street.length > 100) throw new ConvexError("Street must be between 5 and 100 characters");
  if (address.city.length < 2 || address.city.length > 50) throw new ConvexError("City must be between 2 and 50 characters");
  if (address.region.length < 2 || address.region.length > 50) throw new ConvexError("Region must be between 2 and 50 characters");
  if (address.postalCode.length < 2 || address.postalCode.length > 20) throw new ConvexError("Postal code must be between 2 and 20 characters");
  if (address.country.length < 2 || address.country.length > 50) throw new ConvexError("Country must be between 2 and 50 characters");
}

function validateMeasurements(measurements: unknown) {
  if (measurements === undefined) return;
  if (!measurements || typeof measurements !== "object" || Array.isArray(measurements)) {
    throw new ConvexError("Measurements must be a plain object.");
  }
  const prototype = Object.getPrototypeOf(measurements);
  if (prototype !== Object.prototype && prototype !== null) throw new ConvexError("Measurements must be a plain object.");
  if (Object.keys(measurements).length > 40) throw new ConvexError("Measurements may contain at most 40 fields.");
  const serialized = JSON.stringify(measurements);
  if (!serialized || serialized.length > 4000) throw new ConvexError("Measurements must be at most 4000 characters when serialized.");
}

function validateCustomerDetails(details: { firstName: string; lastName: string; email?: string }) {
  if (details.firstName.trim().length < 1 || details.firstName.length > 100) throw new ConvexError("First name must be between 1 and 100 characters.");
  if (details.lastName.trim().length < 1 || details.lastName.length > 100) throw new ConvexError("Last name must be between 1 and 100 characters.");
  if (details.email !== undefined && (details.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()))) {
    throw new ConvexError("Enter a valid customer email address.");
  }
}

async function findPromo(ctx: any, submittedCode: string) {
  const raw = submittedCode.trim();
  const normalized = raw.toUpperCase();
  const upperMatch = await ctx.db.query("promotions").withIndex("by_code", (q: any) => q.eq("code", normalized)).first();
  if (upperMatch) return upperMatch;
  const rawMatch = await ctx.db.query("promotions").withIndex("by_code", (q: any) => q.eq("code", raw)).first();
  if (rawMatch) return rawMatch;
  // Legacy promo rows may have arbitrary casing; the table is an admin-managed catalog.
  return (await ctx.db.query("promotions").collect()).find((promo: any) => promo.code.trim().toUpperCase() === normalized) ?? null;
}

async function readNumericSetting(ctx: any, key: string, fallback: number): Promise<number> {
  const setting = await ctx.db.query("settings").withIndex("by_key", (q: any) => q.eq("key", key)).first();
  const value = setting ? Number(setting.value) : fallback;
  if (!Number.isFinite(value) || value < 0) throw new ConvexError(`Configured ${key} must be a finite non-negative amount.`);
  return value;
}

async function readRateAtOrderTime(ctx: any, displayCurrency?: string): Promise<number | undefined> {
  if (!displayCurrency) return undefined;
  if (!SUPPORTED_DISPLAY_CURRENCIES.includes(displayCurrency)) throw new ConvexError("Unsupported display currency.");
  if (displayCurrency === "GHS") return 1;
  const exchangeRate = await ctx.db.query("exchangeRates")
    .withIndex("by_currency", (q: any) => q.eq("currency", displayCurrency))
    .first();
  const manualSetting = await ctx.db.query("settings")
    .withIndex("by_key", (q: any) => q.eq("key", `manualRate${displayCurrency}`))
    .first();
  const manualRate = manualSetting ? Number(manualSetting.value) : exchangeRate?.manualRate;
  if (Number.isFinite(manualRate) && manualRate > 0) return manualRate;
  if (!exchangeRate || !Number.isFinite(exchangeRate.liveRate) || exchangeRate.liveRate <= 0) return undefined;
  const buffer = await readNumericSetting(ctx, "safetyBufferPercentage", 0);
  return exchangeRate.liveRate * (1 + buffer / 100);
}

export const createCheckoutSession = mutation({
  args: {
    items: checkoutItemsValidator,
    shippingAddress: shippingAddressValidator,
    customerDetails: customerDetailsValidator,
    promoCode: v.optional(v.string()),
    displayCurrency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Please sign in to check out." });
    if (args.items.length === 0 || args.items.length > 100) throw new ConvexError("Cart must contain between 1 and 100 submitted lines.");
    validateShippingAddress(args.shippingAddress);
    validateCustomerDetails(args.customerDetails);

    const pendingSince = Date.now() - 60 * 60 * 1000;
    const recentPending = await ctx.db.query("checkoutSessions")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "pending").gt("createdAt", pendingSince))
      .collect();
    if (recentPending.filter(session => session.userId === identity.subject).length >= 5) {
      throw new ConvexError("Too many checkout attempts. Please wait before starting another payment.");
    }

    for (const item of args.items) validateMeasurements(item.measurements);
    const measurementByKey = new Map<string, string>();
    for (const item of args.items) {
      const key = `${item.productId}\u0000${item.variantSku ?? ""}`;
      const serialized = item.measurements === undefined ? "" : JSON.stringify(item.measurements);
      const existing = measurementByKey.get(key);
      if (existing !== undefined && existing !== serialized) {
        throw new ConvexError("Duplicate cart lines have conflicting measurements.");
      }
      measurementByKey.set(key, serialized);
    }
    let lines: typeof args.items;
    try {
      lines = mergeAndValidateCartLines(args.items as any) as typeof args.items;
    } catch (error) {
      throw new ConvexError(error instanceof Error ? error.message : "Invalid cart quantities.");
    }

    const sessionItems = [];
    for (const item of lines) {
      const product = await ctx.db.get(item.productId);
      if (!product || product.status !== "active") throw new ConvexError("A cart product is missing or no longer available.");
      if (product.variants?.length) {
        if (item.variantSku && item.variantSku !== "custom" && !product.variants.some((variant: any) => variant.sku === item.variantSku)) {
          throw new ConvexError(`Selected SKU is not available for ${product.name}.`);
        }
        if (!item.variantSku && product.type === "ready_to_wear") throw new ConvexError(`Select an available size for ${product.name}.`);
      } else if (product.type === "ready_to_wear" && item.variantSku !== "custom" && item.variantSku !== product.sku) {
        throw new ConvexError(`A valid product SKU is required for ${product.name}.`);
      }
      const unitPesewas = lineUnitPrice(product, item.variantSku);
      sessionItems.push({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
        unitPesewas,
        productName: product.name,
        measurements: item.measurements,
      });
    }

    const shortages = await checkAvailability(ctx, lines as any, { excludeUserId: identity.subject });
    if (shortages.length > 0) {
      throw new ConvexError(`Insufficient stock for ${shortages.map(row => `${row.productName} (${row.variantSku})`).join(", ")}.`);
    }

    const shippingRate = await readNumericSetting(ctx, "standardShippingRate", 50);
    const freeShippingThreshold = await readNumericSetting(ctx, "freeShippingThreshold", 0);
    let promo: any = undefined;
    let promoId: any = undefined;
    let promoCode: string | undefined;
    if (args.promoCode?.trim()) {
      const matched = await findPromo(ctx, args.promoCode);
      if (!matched || !matched.isActive || (matched.validUntil !== undefined && matched.validUntil < Date.now())) {
        throw new ConvexError("Promo code is invalid or expired.");
      }
      if (matched.maxRedemptions !== undefined && (matched.redemptions ?? 0) >= matched.maxRedemptions) {
        throw new ConvexError("This promo code has reached its usage limit.");
      }
      promo = {
        discountType: matched.discountType,
        discountValue: matched.discountValue,
        minOrderAmountPesewas: matched.minOrderAmount === undefined ? undefined : toPesewas(matched.minOrderAmount),
      };
      promoId = matched._id;
      promoCode = matched.code.trim().toUpperCase();
    }

    let totals;
    try {
      totals = computeTotals({
        lines: sessionItems.map(item => ({ unitPesewas: item.unitPesewas, quantity: item.quantity })),
        shippingRatePesewas: toPesewas(shippingRate),
        freeShippingThresholdPesewas: toPesewas(freeShippingThreshold),
        promo,
      });
    } catch (error) {
      throw new ConvexError(error instanceof Error ? error.message : "Unable to calculate checkout totals.");
    }

    if (args.displayCurrency && !SUPPORTED_DISPLAY_CURRENCIES.includes(args.displayCurrency)) {
      throw new ConvexError("Unsupported display currency.");
    }
    const rateAtOrderTime = await readRateAtOrderTime(ctx, args.displayCurrency);
    const emailFromIdentity = typeof (identity as any).email === "string" ? (identity as any).email.trim() : "";
    const email = emailFromIdentity || args.customerDetails.email?.trim();
    if (!email) throw new ConvexError("A valid email address is required for Paystack checkout.");

    const reference = generatePaymentReference();
    await ctx.db.insert("checkoutSessions", {
      reference,
      userId: identity.subject,
      customerDetails: {
        email,
        firstName: args.customerDetails.firstName.trim(),
        lastName: args.customerDetails.lastName.trim(),
      },
      items: sessionItems,
      shippingAddress: args.shippingAddress,
      promoCode,
      promoId,
      subtotalPesewas: totals.subtotal,
      discountPesewas: totals.discount,
      shippingPesewas: totals.shipping,
      expectedAmountPesewas: totals.total,
      currency: "GHS",
      displayCurrency: args.displayCurrency,
      rateAtOrderTime,
      status: "pending",
      createdAt: Date.now(),
    });

    return {
      reference,
      amountPesewas: totals.total,
      email,
      totals: {
        subtotal: fromPesewas(totals.subtotal),
        discount: fromPesewas(totals.discount),
        shipping: fromPesewas(totals.shipping),
        total: fromPesewas(totals.total),
      },
    };
  },
});

export const getSessionByReference = internalQuery({
  args: { reference: v.string() },
  handler: async (ctx, args) => await ctx.db.query("checkoutSessions")
    .withIndex("by_reference", q => q.eq("reference", args.reference)).first(),
});

export const finalizeCheckoutPaid = internalMutation({
  args: {
    reference: v.string(),
    amountPesewas: v.number(),
    currency: v.string(),
    paidAt: v.optional(v.string()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("checkoutSessions")
      .withIndex("by_reference", q => q.eq("reference", args.reference)).first();
    if (!session) {
      await ctx.db.insert("paymentIssues", {
        reference: args.reference, kind: "payment_without_session",
        details: `Received verified Paystack payment from ${args.source} without a checkout session.`,
        amountPesewas: args.amountPesewas, resolved: false, createdAt: Date.now(),
      });
      return null;
    }
    if (session.status === "paid" && session.orderId) {
      const existing = await ctx.db.get(session.orderId);
      if (!existing) throw new ConvexError("Paid checkout session references a missing order.");
      return { orderId: existing._id, orderNumber: existing.orderId ?? "" };
    }

    const recordIssue = async (kind: string, details: string, amountPesewas?: number) => {
      const existingIssues = await ctx.db.query("paymentIssues")
        .withIndex("by_reference", q => q.eq("reference", args.reference)).collect();
      if (!existingIssues.some(issue => issue.kind === kind && !issue.resolved)) {
        await ctx.db.insert("paymentIssues", {
          reference: args.reference, kind, details, amountPesewas,
          relatedId: session._id, resolved: false, createdAt: Date.now(),
        });
      }
    };

    if (!Number.isSafeInteger(args.amountPesewas) || args.amountPesewas < 0) {
      await recordIssue("amount_mismatch", "Verified transaction amount was invalid.", args.amountPesewas);
      return null;
    }
    if (args.currency !== "GHS") {
      await recordIssue("wrong_currency", `Expected GHS but verified ${args.currency}.`, args.amountPesewas);
      return null;
    }
    if (args.amountPesewas < session.expectedAmountPesewas) {
      await recordIssue("underpaid", `Paid ${args.amountPesewas} pesewas; expected ${session.expectedAmountPesewas}.`, args.amountPesewas);
      return null;
    }
    if (args.amountPesewas > session.expectedAmountPesewas) {
      await recordIssue("overpaid", `Overpayment difference: ${args.amountPesewas - session.expectedAmountPesewas} pesewas.`, args.amountPesewas - session.expectedAmountPesewas);
    }

    const shortages = await apply(ctx, session.items.map(item => ({
      productId: item.productId,
      variantSku: item.variantSku,
      quantity: item.quantity,
    })));
    const onHold = shortages.length > 0;
    if (onHold) {
      await recordIssue("oversold", `Payment received but stock is insufficient: ${shortages.map(row => `${row.productName}/${row.variantSku} short ${row.shortage}`).join(", ")}.`, args.amountPesewas);
    }

    const promo = session.promoId ? await ctx.db.get(session.promoId) : null;
    if (promo) await ctx.db.patch(promo._id, { redemptions: (promo.redemptions ?? 0) + 1 });

    const orderNumber = await nextOrderNumber(ctx);
    const totalAmount = fromPesewas(session.expectedAmountPesewas);
    const amountPaid = fromPesewas(args.amountPesewas);
    const orderId = await ctx.db.insert("orders", {
      orderId: orderNumber,
      userId: session.userId,
      customerDetails: session.customerDetails,
      items: session.items.map(item => ({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
        priceAtPurchase: fromPesewas(item.unitPesewas),
        productName: item.productName,
        measurements: item.measurements,
      })),
      subtotal: fromPesewas(session.subtotalPesewas),
      shippingFee: fromPesewas(session.shippingPesewas),
      discountAmount: fromPesewas(session.discountPesewas),
      promoCodeId: session.promoId,
      totalAmount,
      status: onHold ? "on_hold" : "processing",
      paymentStatus: "paid",
      paystackReference: args.reference,
      shippingAddress: session.shippingAddress,
      baseTotalAmount: totalAmount,
      chargedCurrency: "GHS",
      chargedAmount: amountPaid,
      rateAtOrderTime: session.rateAtOrderTime,
      displayCurrency: session.displayCurrency,
      gatewayUsed: "paystack",
      depositRequired: false,
      amountPaid,
      amountDue: 0,
    });
    await ctx.db.patch(session._id, { status: "paid", orderId });

    const reserves = await ctx.db.query("activeCheckouts")
      .withIndex("by_userId", q => q.eq("userId", session.userId)).collect();
    for (const reserve of reserves) await ctx.db.delete(reserve._id);

    if (session.customerDetails.email) {
      await ctx.scheduler.runAfter(0, internal.email.sendOrderConfirmation, {
        orderId,
        email: session.customerDetails.email,
        name: session.customerDetails.firstName,
        amount: totalAmount,
      });
    }

    const openIssues = await ctx.db.query("paymentIssues")
      .withIndex("by_reference", q => q.eq("reference", args.reference)).collect();
    for (const issue of openIssues) {
      if (!issue.resolved && (issue.kind === "payment_without_session" || issue.kind === "unmatched_payment")) {
        await ctx.db.patch(issue._id, { resolved: true });
      }
    }
    return { orderId, orderNumber };
  },
});

export const verifyCheckout = action({
  args: { reference: v.string() },
  handler: async (ctx, args): Promise<{ orderId: Id<"orders">; orderNumber: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Please sign in to verify this checkout." });
    const session: any = await ctx.runQuery(internal.checkout.getSessionByReference, { reference: args.reference });
    if (!session || session.userId !== identity.subject) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Checkout payment could not be matched to your account." });
    }
    if (session.status === "paid" && session.orderId) {
      const order: any = await ctx.runQuery(internal.orders.getByIdInternal, { orderId: session.orderId });
      return { orderId: session.orderId, orderNumber: order?.orderId ?? "" };
    }

    let verified;
    try {
      verified = await verifyPaystackTransaction(args.reference);
    } catch (error) {
      throw new ConvexError(error instanceof Error
        ? error.message
        : "Payment status could not be checked. Please do not pay again; your payment is being verified.");
    }
    if (verified.reference !== args.reference) throw new ConvexError("Paystack returned a different payment reference.");
    if (!verified.ok) throw new ConvexError(`Payment is not confirmed (${verified.status}). If you were charged, do not pay again; contact support with your payment reference.`);

    const result: { orderId: Id<"orders">; orderNumber: string } | null = await ctx.runMutation(internal.checkout.finalizeCheckoutPaid, {
      reference: args.reference,
      amountPesewas: verified.amountPesewas,
      currency: verified.currency,
      paidAt: verified.paidAt,
      source: "client_verify",
    });
    if (!result) throw new ConvexError("Payment requires review. Do not pay again; contact support with your payment reference.");
    return result;
  },
});
