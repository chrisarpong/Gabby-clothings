import { describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";
import { constantTimeEqual, verifyPaystackWebhookSignature } from "./lib/paystack";

const address = { street: "123 Main Street", city: "Accra", region: "Greater Accra", postalCode: "00233", country: "Ghana" };
vi.spyOn(console, "log").mockImplementation(() => undefined);

async function seedProduct(t: any) {
  return await t.run(async (ctx: any) => ctx.db.insert("products", { name: "Webhook Shirt", slug: `webhook-${Date.now()}`, category: "shirts", description: "test", type: "ready_to_wear", status: "active", basePrice: 100, sku: "WEBHOOK-SKU", stock: 3, images: [] }));
}

describe("Paystack webhook reconciliation", () => {
  it("rejects a bad signature using constant-time comparison", async () => {
    const raw = JSON.stringify({ event: "charge.success" });
    expect(constantTimeEqual("abc", "abd")).toBe(false);
    expect(await verifyPaystackWebhookSignature(raw, "bad", "sk_test_secret")).toBe(false);
    process.env.PAYSTACK_SECRET_KEY = "sk_test_webhook_secret";
    const t = convexTest(schema);
    const response = await t.fetch("/webhooks/paystack", { method: "POST", headers: { "content-type": "application/json", "x-paystack-signature": "bad" }, body: raw });
    expect(response.status).toBe(401);
  });

  it("ignores a validly signed non-charge event", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_webhook_secret";
    const t = convexTest(schema);
    const body = JSON.stringify({ event: "subscription.create", data: {} });
    const signature = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(body).digest("hex");
    const response = await t.fetch("/webhooks/paystack", { method: "POST", headers: { "x-paystack-signature": signature }, body });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Ignored");
  });

  it("rejects a malformed charge success payload", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_webhook_secret";
    const t = convexTest(schema);
    const body = JSON.stringify({ event: "charge.success", data: {} });
    const signature = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(body).digest("hex");
    const response = await t.fetch("/webhooks/paystack", { method: "POST", headers: { "x-paystack-signature": signature }, body });
    expect(response.status).toBe(400);
  });

  it("dispatches a valid signed checkout webhook through the HTTP route", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_webhook_secret";
    const t = convexTest(schema);
    const productId = await seedProduct(t);
    await t.run(async (ctx: any) => ctx.db.insert("checkoutSessions", { reference: "HTTP-CHECKOUT", userId: "user_http", customerDetails: { firstName: "Test", lastName: "Buyer", email: "buyer@example.test" }, items: [{ productId, variantSku: "WEBHOOK-SKU", quantity: 1, unitPesewas: 10000, productName: "Webhook Shirt" }], shippingAddress: address, subtotalPesewas: 10000, discountPesewas: 0, shippingPesewas: 0, expectedAmountPesewas: 10000, currency: "GHS", status: "pending", createdAt: Date.now() }));
    const body = JSON.stringify({ event: "charge.success", data: { reference: "HTTP-CHECKOUT", amount: 10000, currency: "GHS" } });
    const signature = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(body).digest("hex");
    const response = await t.fetch("/webhooks/paystack", { method: "POST", headers: { "content-type": "application/json", "x-paystack-signature": signature }, body });
    expect(response.status).toBe(200);
    const orders: any[] = await t.run(async (ctx: any) => ctx.db.query("orders").collect());
    expect(orders).toHaveLength(1);
    await t.finishInProgressScheduledFunctions();
  });

  it("finalizes a checkout reference idempotently", async () => {
    const t = convexTest(schema);
    const productId = await seedProduct(t);
    await t.run(async (ctx: any) => ctx.db.insert("checkoutSessions", { reference: "WEBHOOK-CHECKOUT", userId: "user_webhook", customerDetails: { firstName: "Test", lastName: "Buyer", email: "buyer@example.test" }, items: [{ productId, variantSku: "WEBHOOK-SKU", quantity: 1, unitPesewas: 10000, productName: "Webhook Shirt" }], shippingAddress: address, subtotalPesewas: 10000, discountPesewas: 0, shippingPesewas: 0, expectedAmountPesewas: 10000, currency: "GHS", status: "pending", createdAt: Date.now() }));
    const first = await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "WEBHOOK-CHECKOUT", amountPesewas: 10000, currency: "GHS" });
    const second = await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "WEBHOOK-CHECKOUT", amountPesewas: 10000, currency: "GHS" });
    expect(first?.orderId).toBe(second?.orderId);
    const result = await t.run(async (ctx: any) => ({ orders: await ctx.db.query("orders").collect(), product: await ctx.db.get(productId) }));
    expect(result.orders).toHaveLength(1);
    expect(result.product.stock).toBe(2);
    await t.finishInProgressScheduledFunctions();
  });

  it("confirms an appointment reference once", async () => {
    const t = convexTest(schema);
    const appointmentId = await t.run(async (ctx: any) => ctx.db.insert("appointments", { name: "Client", email: "client@example.test", phone: "0240000000", date: "2099-11-01", time: "10:00", status: "pending", paymentStatus: "awaiting_payment", expectedAmountPesewas: 5000, paystackReference: "WEBHOOK-APT" }));
    await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "WEBHOOK-APT", amountPesewas: 5000, currency: "GHS" });
    await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "WEBHOOK-APT", amountPesewas: 5000, currency: "GHS" });
    const appointment: any = await t.run(async (ctx: any) => ctx.db.get(appointmentId));
    expect(appointment.paymentStatus).toBe("paid");
    expect(appointment.status).toBe("confirmed");
    await t.finishInProgressScheduledFunctions();
  });

  it("records an unmatched reference and does not create a session issue", async () => {
    const t = convexTest(schema);
    await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "WEBHOOK-UNKNOWN", amountPesewas: 1000, currency: "GHS" });
    const issues: any[] = await t.run(async (ctx: any) => ctx.db.query("paymentIssues").collect());
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("unmatched_payment");
  });

  it("does not confirm an underpaid appointment", async () => {
    const t = convexTest(schema);
    const appointmentId = await t.run(async (ctx: any) => ctx.db.insert("appointments", { name: "Client", email: "client@example.test", phone: "0240000000", date: "2099-11-01", status: "pending", paymentStatus: "awaiting_payment", expectedAmountPesewas: 5000, paystackReference: "WEBHOOK-UNDER" }));
    await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "WEBHOOK-UNDER", amountPesewas: 4000, currency: "GHS" });
    const result: any = await t.run(async (ctx: any) => ({ appointment: await ctx.db.get(appointmentId), issues: await ctx.db.query("paymentIssues").collect() }));
    expect(result.appointment.paymentStatus).toBe("awaiting_payment");
    expect(result.issues[0].kind).toBe("amount_mismatch");
  });
});
