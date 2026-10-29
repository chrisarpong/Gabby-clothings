import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const reconcilePaystackPayment = internalMutation({
  args: { reference: v.string(), amountPesewas: v.number(), currency: v.string(), paidAt: v.optional(v.string()) },
  handler: async (ctx, args): Promise<any> => {
    const checkout = await ctx.db.query("checkoutSessions").withIndex("by_reference", q => q.eq("reference", args.reference)).first();
    if (checkout) return await ctx.runMutation(internal.checkout.finalizeCheckoutPaid, { reference: args.reference, amountPesewas: args.amountPesewas, currency: args.currency, paidAt: args.paidAt, source: "paystack_webhook" });
    const appointment = await ctx.db.query("appointments").withIndex("by_paystackReference", q => q.eq("paystackReference", args.reference)).first();
    if (appointment) return await ctx.runMutation(internal.appointments.finalizeAppointmentPayment, { appointmentId: appointment._id, reference: args.reference, amountPesewas: args.amountPesewas, currency: args.currency });
    const order = await ctx.db.query("orders").withIndex("by_paystackReference", q => q.eq("paystackReference", args.reference)).first();
    if (order) return order._id;
    await ctx.db.insert("paymentIssues", { reference: args.reference, kind: "unmatched_payment", details: "Verified Paystack payment did not match a checkout session, appointment, or order.", amountPesewas: args.amountPesewas, resolved: false, createdAt: Date.now() });
    return null;
  },
});
