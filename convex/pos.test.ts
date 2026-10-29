import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { createHash } from "node:crypto";
import schema from "./schema";
import { api } from "./_generated/api";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
async function staff(t: any, role: string, name = role) {
  const token = `${role}-${name}-token`;
  await t.run(async (ctx: any) => {
    const id = await ctx.db.insert("staff", { name, email: `${name}@test.local`, role, passwordHash: "x", passwordSalt: "x", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now() });
    await ctx.db.insert("staffSessions", { staffId: id, tokenHash: hash(token), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
  });
  return token;
}
async function product(t: any, stock = 10) {
  return await t.run((ctx: any) => ctx.db.insert("products", { name: "POS Shirt", slug: `pos-${Math.random()}`, category: "shirts", description: "test", type: "ready_to_wear", status: "active", basePrice: 100, sku: "POS-SKU", stock, images: [] }));
}
const customerDetails = { firstName: "Buyer", lastName: "Test", email: "buyer@test.local" };

describe("POS money core", () => {
  it("enforces sales override bounds, allows CEO pricing, and logs custom jobs", async () => {
    const t = convexTest(schema);
    const sales = await staff(t, "sales", "sales-one");
    const ceo = await staff(t, "ceo", "ceo-one");
    const productId = await product(t);
    await expect(t.mutation(api.orders.createPOSOrder, { staffToken: sales, customerDetails, items: [{ productId, variantSku: "POS-SKU", quantity: 1, unitPriceOverride: 110 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "raise" })).rejects.toThrow();
    await expect(t.mutation(api.orders.createPOSOrder, { staffToken: sales, customerDetails, items: [{ productId, variantSku: "POS-SKU", quantity: 1, unitPriceOverride: 79 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "low" })).rejects.toThrow();
    const ceoOrder = await t.mutation(api.orders.createPOSOrder, { staffToken: ceo, customerDetails, items: [{ productId, variantSku: "POS-SKU", quantity: 1, unitPriceOverride: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "ceo-price" });
    expect(ceoOrder).toBeTruthy();
    const custom = await t.mutation(api.orders.createPOSOrder, { staffToken: sales, customerDetails, items: [{ name: "Alteration", unitPriceOverride: 25, quantity: 2, notes: "hem" }], payInFull: true, paymentMethod: "cash", idempotencyKey: "custom" });
    const row: any = await t.run((ctx: any) => ctx.db.get(custom));
    expect(row.items[0].isCustomJob).toBe(true);
    const logs: any[] = await t.run((ctx: any) => ctx.db.query("adminLogs").collect());
    expect(logs.some((log: any) => log.action === "Created POS custom job")).toBe(true);
  });

  it("rejects invalid custom quantities/prices and empty sales", async () => {
    const t = convexTest(schema); const token = await staff(t, "ceo", "invalid");
    for (const item of [{ name: "x", unitPriceOverride: 0, quantity: 1 }, { name: "x", unitPriceOverride: 1, quantity: 0 }, { name: "x", unitPriceOverride: 1, quantity: 1.5 }, { name: "x", unitPriceOverride: 1, quantity: 51 }, { name: "x" }]) {
      await expect(t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [item as any], payInFull: true, paymentMethod: "cash", idempotencyKey: `invalid-${Math.random()}` })).rejects.toThrow();
    }
    await expect(t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [], payInFull: true, paymentMethod: "cash", idempotencyKey: "empty" })).rejects.toThrow();
  });

  it("computes deposits, rejects overpay/fake users, and is idempotent without a second stock decrement", async () => {
    const t = convexTest(schema); const token = await staff(t, "ceo", "idem"); const other = await staff(t, "ceo", "other"); const productId = await product(t, 3);
    const args: any = { staffToken: token, customerDetails, items: [{ productId, variantSku: "POS-SKU", quantity: 1 }], payInFull: false, amountPaid: 40, paymentMethod: "cash", idempotencyKey: "same-key" };
    const first = await t.mutation(api.orders.createPOSOrder, args);
    const second = await t.mutation(api.orders.createPOSOrder, args);
    expect(second).toBe(first);
    const row: any = await t.run((ctx: any) => ctx.db.get(first));
    expect(row.paymentStatus).toBe("partial"); expect(row.amountDue).toBe(60);
    expect((await t.run((ctx: any) => ctx.db.get(productId)) as any).stock).toBe(2);
    await expect(t.mutation(api.orders.createPOSOrder, { ...args, staffToken: other })).rejects.toThrow();
    await expect(t.mutation(api.orders.createPOSOrder, { ...args, idempotencyKey: "over", payInFull: false, amountPaid: 101 })).rejects.toThrow();
    await expect(t.mutation(api.orders.createPOSOrder, { ...args, idempotencyKey: "fake", userId: "missing" })).rejects.toThrow();
  });

  it("manual payments cap at due, transition partial to paid, and reject cancelled orders", async () => {
    const t = convexTest(schema); const token = await staff(t, "ceo", "payments");
    const orderId: any = await t.run((ctx: any) => ctx.db.insert("orders", { userId: "guest", items: [], totalAmount: 100, amountPaid: 0, amountDue: 100, paymentStatus: "pending", status: "processing" }));
    await expect(t.mutation(api.orders.recordDeposit, { staffToken: token, orderId, amountPaid: 101, paymentMethod: "cash" })).rejects.toThrow();
    await expect(t.mutation(api.orders.recordDeposit, { staffToken: token, orderId, amountPaid: 0, paymentMethod: "cash" })).rejects.toThrow();
    await t.mutation(api.orders.recordDeposit, { staffToken: token, orderId, amountPaid: 40, paymentMethod: "transfer" });
    await t.mutation(api.payments.recordCashPayment, { staffToken: token, orderId, amount: 60, paymentMethod: "cash" });
    expect((await t.run((ctx: any) => ctx.db.get(orderId)) as any).paymentStatus).toBe("paid");
    await t.run((ctx: any) => ctx.db.patch(orderId, { status: "cancelled" }));
    await expect(t.mutation(api.payments.recordCashPayment, { staffToken: token, orderId, amount: 1, paymentMethod: "cash" })).rejects.toThrow();
  });

  it("accepts on_hold and rejects invented statuses without touching stock", async () => {
    const t = convexTest(schema); const token = await staff(t, "ceo", "statuses"); const productId = await product(t, 2);
    const orderId = await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ productId, variantSku: "POS-SKU", quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "status-order" });
    await t.mutation(api.orders.updateStatus, { staffToken: token, orderId, status: "on_hold" });
    await t.mutation(api.orders.updateStatus, { staffToken: token, orderId, status: "processing" });
    await expect(t.mutation(api.orders.updateStatus, { staffToken: token, orderId, status: "invented" })).rejects.toThrow();
    expect((await t.run((ctx: any) => ctx.db.get(productId)) as any).stock).toBe(1);
  });

  it("tracks base SKU stock, requires variants, leaves custom untracked, and uses pesewa precision", async () => {
    const t = convexTest(schema); const token = await staff(t, "sales", "stock-rules");
    const baseId = await product(t, 2);
    await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ productId: baseId, quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "base-sku" });
    expect((await t.run((ctx: any) => ctx.db.get(baseId)) as any).stock).toBe(1);
    const variantId: any = await t.run((ctx: any) => ctx.db.insert("products", { name: "Variant", slug: "variant", category: "shirts", description: "x", type: "ready_to_wear", status: "active", basePrice: 100, variants: [{ sku: "V-S", size: "S", color: "default", stock: 2 }], images: [] }));
    await expect(t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ productId: variantId, quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "missing-variant" })).rejects.toThrow("choose a size");
    const before = (await t.run((ctx: any) => ctx.db.get(baseId)) as any).stock;
    await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ productId: baseId, variantSku: "custom", quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "custom-fit" });
    expect((await t.run((ctx: any) => ctx.db.get(baseId)) as any).stock).toBe(before);
    await expect(t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ productId: baseId, unitPriceOverride: 1.001, quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "three-decimal" })).rejects.toThrow();
  });
});
