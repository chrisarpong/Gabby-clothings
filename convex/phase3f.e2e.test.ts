import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { createHash } from "node:crypto";
import schema from "./schema";
import { api, internal } from "./_generated/api";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const details = { firstName: "Dry", lastName: "Run", email: "dry@example.test" };

async function makeStaff(t: any, role: string, name: string) {
  const token = `${name}-token`;
  await t.run(async (ctx: any) => {
    const id = await ctx.db.insert("staff", { name, email: `${name}@test.local`, role, passwordHash: "x", passwordSalt: "x", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now() });
    await ctx.db.insert("staffSessions", { staffId: id, tokenHash: hash(token), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
  });
  return token;
}

async function makeProduct(t: any, stock = 20) {
  return t.run((ctx: any) => ctx.db.insert("products", { name: "Dry Run Shirt", slug: `dry-${Date.now()}-${Math.random()}`, category: "shirts", description: "test", type: "ready_to_wear", status: "active", basePrice: 100, sku: "DRY-SKU", stock, images: [] }));
}

describe("phase 3F combined money dry run", () => {
  it("reconciles online checkout, appointment late payment, and POS retry/payment flows", async () => {
    const t = convexTest(schema);
    const productId = await makeProduct(t);

    // Online checkout -> webhook -> duplicate browser verification equivalent.
    await t.run(async (ctx: any) => ctx.db.insert("checkoutSessions", {
      reference: "DRY-CHECKOUT", userId: "dry-user", customerDetails: details,
      items: [{ productId, variantSku: "DRY-SKU", quantity: 1, unitPesewas: 10000, productName: "Dry Run Shirt" }],
      shippingAddress: { street: "1 Main", city: "Accra", region: "GA", postalCode: "00233", country: "Ghana" },
      subtotalPesewas: 10000, discountPesewas: 0, shippingPesewas: 0, expectedAmountPesewas: 10000,
      currency: "GHS", status: "pending", createdAt: Date.now(),
    }));
    await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "DRY-CHECKOUT", amountPesewas: 10000, currency: "GHS" });
    await t.mutation(internal.webhooks.reconcilePaystackPayment, { reference: "DRY-CHECKOUT", amountPesewas: 10000, currency: "GHS" });
    expect((await t.run(async (ctx: any) => ctx.db.query("orders").collect()))).toHaveLength(1);
    expect((await t.run(async (ctx: any) => ctx.db.get(productId) as any)).stock).toBe(19);

    // Expiry followed by a late payment while the slot is free.
    const freeAppointment = await t.run(async (ctx: any) => ctx.db.insert("appointments", { name: "Free", email: "free@example.test", phone: "0240000000", date: "2099-12-01", time: "10:00", status: "pending", paymentStatus: "awaiting_payment", paymentExpiresAt: Date.now() - 1, expectedAmountPesewas: 5000, paystackReference: "DRY-APT-FREE" }));
    await t.mutation(internal.appointments.expireAwaitingPayments, {});
    await t.mutation(internal.appointments.finalizeAppointmentPayment, { appointmentId: freeAppointment, reference: "DRY-APT-FREE", amountPesewas: 5000, currency: "GHS" });
    expect((await t.run(async (ctx: any) => ctx.db.get(freeAppointment) as any)).paymentStatus).toBe("paid");

    // A claimed slot stays unresolved as a payment issue.
    const takenAppointment = await t.run(async (ctx: any) => ctx.db.insert("appointments", { name: "Taken", email: "taken@example.test", phone: "0240000001", date: "2099-12-02", time: "10:00", status: "pending", paymentStatus: "awaiting_payment", paymentExpiresAt: Date.now() - 1, expectedAmountPesewas: 5000, paystackReference: "DRY-APT-TAKEN" }));
    await t.run(async (ctx: any) => ctx.db.insert("appointments", { name: "Occupier", email: "occupier@example.test", phone: "0240000002", date: "2099-12-02", time: "10:00", status: "confirmed", paymentStatus: "paid" }));
    await t.mutation(internal.appointments.expireAwaitingPayments, {});
    await t.mutation(internal.appointments.finalizeAppointmentPayment, { appointmentId: takenAppointment, reference: "DRY-APT-TAKEN", amountPesewas: 5000, currency: "GHS" });
    expect((await t.run(async (ctx: any) => ctx.db.query("paymentIssues").collect())).some((i: any) => i.kind === "paid_but_slot_taken")).toBe(true);

    // POS full sale, deposit then balance, custom job, and retry idempotency.
    const salesToken = await makeStaff(t, "sales", "dry-sales");
    const full = await t.mutation(api.orders.createPOSOrder, { staffToken: salesToken, customerDetails: details, items: [{ productId, quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "dry-full" });
    expect(full).toBeTruthy();
    const deposit = await t.mutation(api.orders.createPOSOrder, { staffToken: salesToken, customerDetails: details, items: [{ productId, quantity: 1 }], payInFull: false, amountPaid: 40, paymentMethod: "cash", idempotencyKey: "dry-deposit" });
    await t.mutation(api.orders.recordManualPayment, { staffToken: salesToken, orderId: deposit, amount: 60, paymentMethod: "transfer", notes: "dry balance" });
    expect((await t.run(async (ctx: any) => ctx.db.get(deposit) as any)).paymentStatus).toBe("paid");
    const custom = await t.mutation(api.orders.createPOSOrder, { staffToken: salesToken, customerDetails: details, items: [{ name: "Dry alteration", unitPriceOverride: 25, quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "dry-custom" });
    expect(custom).toBeTruthy();
    const retryArgs: any = { staffToken: salesToken, customerDetails: details, items: [{ productId, quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "dry-retry" };
    const retryOne = await t.mutation(api.orders.createPOSOrder, retryArgs);
    const retryTwo = await t.mutation(api.orders.createPOSOrder, retryArgs);
    expect(retryTwo).toBe(retryOne);
    const stock = (await t.run(async (ctx: any) => ctx.db.get(productId) as any)).stock;
    expect(stock).toBe(16);
  });
});
