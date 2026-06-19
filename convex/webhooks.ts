import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Idempotent payment reconciliation called by the Paystack webhook.
 *
 * This handles the critical case where a customer pays (especially via
 * Mobile Money / USSD) but their browser loses connectivity before
 * the frontend redirect can call our verify action.
 *
 * Logic:
 * 1. Check appointments for a matching paystackReference → mark as paid.
 * 2. Check orders for a matching paystackReference → mark as paid.
 * 3. If neither exists, check for a pending appointment by customer email
 *    that has paymentStatus "pending" → attach the reference and mark paid.
 * 4. If nothing matches, log and exit (the verify action will handle it
 *    when the user's browser eventually reconnects).
 */
export const reconcilePaystackPayment = internalMutation({
  args: {
    paystackReference: v.string(),
    amountPaid: v.number(),
    customerEmail: v.string(),
    paidAt: v.string(),
  },
  handler: async (ctx, args) => {
    // ── 1. Check if an appointment already has this reference (idempotent) ──
    const allAppointments = await ctx.db.query("appointments").collect();
    const existingApt = allAppointments.find(
      (a) => a.paystackReference === args.paystackReference
    );
    if (existingApt) {
      // Already reconciled — ensure it's marked paid (idempotent)
      if (existingApt.paymentStatus !== "paid") {
        await ctx.db.patch(existingApt._id, {
          paymentStatus: "paid",
          amountPaid: args.amountPaid,
        });
      }
      return { reconciled: "appointment", id: existingApt._id, action: "updated" };
    }

    // ── 2. Check if an order already has this reference (idempotent) ──
    const allOrders = await ctx.db.query("orders").collect();
    const existingOrder = allOrders.find(
      (o) => o.paystackReference === args.paystackReference
    );
    if (existingOrder) {
      // Already reconciled — ensure it's marked paid
      if (existingOrder.paymentStatus !== "paid") {
        await ctx.db.patch(existingOrder._id, {
          paymentStatus: "paid",
        });
      }
      return { reconciled: "order", id: existingOrder._id, action: "updated" };
    }

    // ── 3. Find a pending appointment by email that hasn't been paid yet ──
    // This covers the case where the appointment was created in step 1 of
    // the two-step booking flow (paymentStatus: "pending") but the browser
    // dropped before calling the verify action.
    const pendingApt = allAppointments.find(
      (a) =>
        a.email === args.customerEmail &&
        a.paymentStatus === "pending" &&
        !a.paystackReference
    );
    if (pendingApt) {
      await ctx.db.patch(pendingApt._id, {
        paymentStatus: "paid",
        paystackReference: args.paystackReference,
        amountPaid: args.amountPaid,
      });
      return { reconciled: "appointment", id: pendingApt._id, action: "matched_pending" };
    }

    // ── 4. Nothing matched — log for manual reconciliation ──
    console.warn(
      `[Paystack Webhook] No matching record found for reference ${args.paystackReference} ` +
      `(email: ${args.customerEmail}, amount: GH₵${args.amountPaid}). ` +
      `The verify action may handle this when the client reconnects.`
    );
    return { reconciled: "none", action: "logged" };
  },
});
