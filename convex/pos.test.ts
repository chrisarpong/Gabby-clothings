import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { createHash } from "node:crypto";
import schema from "./schema";
import { api } from "./_generated/api";
import { moneyToPesewas } from "./lib/pricing";

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
  it("rounds safe pesewa values and rejects unsafe precision", () => {
    expect(moneyToPesewas(0.07)).toBe(7);
    expect(moneyToPesewas(1.15)).toBe(115);
    expect(moneyToPesewas(8.20)).toBe(820);
    expect(moneyToPesewas(19.99)).toBe(1999);
    expect(moneyToPesewas(0.1 + 0.2)).toBe(30);
    expect(() => moneyToPesewas(10.005)).toThrow();
    expect(() => moneyToPesewas(Number.NaN)).toThrow();
    expect(() => moneyToPesewas(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => moneyToPesewas(-1)).toThrow();
  });
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
    await expect(t.mutation(api.orders.recordManualPayment, { staffToken: token, orderId, amount: 101, paymentMethod: "cash" })).rejects.toThrow();
    await expect(t.mutation(api.orders.recordManualPayment, { staffToken: token, orderId, amount: 0, paymentMethod: "cash" })).rejects.toThrow();
    await t.mutation(api.orders.recordManualPayment, { staffToken: token, orderId, amount: 40, paymentMethod: "transfer" });
    await t.mutation(api.orders.recordManualPayment, { staffToken: token, orderId, amount: 60, paymentMethod: "cash" });
    expect((await t.run((ctx: any) => ctx.db.get(orderId)) as any).paymentStatus).toBe("paid");
    await t.run((ctx: any) => ctx.db.patch(orderId, { status: "cancelled" }));
    await expect(t.mutation(api.orders.recordManualPayment, { staffToken: token, orderId, amount: 1, paymentMethod: "cash" })).rejects.toThrow();
  });

  it("scopes manual payments to sales-owned orders and denies designers", async () => {
    const t = convexTest(schema); const sales = await staff(t, "sales", "manual-sales"); const other = await staff(t, "sales", "manual-other"); const designer = await staff(t, "designer", "manual-designer");
    const own: any = await t.run((ctx: any) => ctx.db.insert("orders", { createdByStaffId: undefined, items: [], totalAmount: 20, amountDue: 20, amountPaid: 0, status: "processing" }));
    const staffRows: any[] = await t.run((ctx: any) => ctx.db.query("staff").collect());
    const salesRow = staffRows.find(row => row.name === "manual-sales");
    await t.run((ctx: any) => ctx.db.patch(own, { createdByStaffId: salesRow._id }));
    await t.mutation(api.orders.recordManualPayment, { staffToken: sales, orderId: own, amount: 5, paymentMethod: "cash" });
    await expect(t.mutation(api.orders.recordManualPayment, { staffToken: other, orderId: own, amount: 5, paymentMethod: "cash" })).rejects.toThrow();
    await expect(t.mutation(api.orders.recordManualPayment, { staffToken: designer, orderId: own, amount: 5, paymentMethod: "cash" })).rejects.toThrow();
  });

  it("creates separate sales for different idempotency keys", async () => {
    const t = convexTest(schema); const token = await staff(t, "sales", "different-keys"); const productId = await product(t, 5);
    const base: any = { staffToken: token, customerDetails, items: [{ productId, quantity: 1 }], payInFull: true, paymentMethod: "cash" };
    const first = await t.mutation(api.orders.createPOSOrder, { ...base, idempotencyKey: "sale-a" });
    const second = await t.mutation(api.orders.createPOSOrder, { ...base, idempotencyKey: "sale-b" });
    expect(second).not.toBe(first);
    expect(((await t.run((ctx: any) => ctx.db.query("orders").collect())) as any[]).length).toBe(2);
  });

  it("allows an admin to record a manual payment", async () => {
    const t = convexTest(schema); const admin = await staff(t, "admin", "manual-admin");
    const orderId: any = await t.run((ctx: any) => ctx.db.insert("orders", { items: [], totalAmount: 10, amountDue: 10, amountPaid: 0, status: "processing" }));
    await t.mutation(api.orders.recordManualPayment, { staffToken: admin, orderId, amount: 10, paymentMethod: "cash" });
    expect((await t.run((ctx: any) => ctx.db.get(orderId)) as any).paymentStatus).toBe("paid");
  });

  it("accepts on_hold and rejects invented statuses without touching stock", async () => {
    const t = convexTest(schema); const token = await staff(t, "ceo", "statuses"); const productId = await product(t, 2);
    const orderId = await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ productId, variantSku: "POS-SKU", quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "status-order" });
    await t.mutation(api.orders.updateStatus, { staffToken: token, orderId, status: "on_hold" });
    await t.mutation(api.orders.updateStatus, { staffToken: token, orderId, status: "processing" });
    await expect(t.mutation(api.orders.updateStatus, { staffToken: token, orderId, status: "invented" })).rejects.toThrow();
    expect((await t.run((ctx: any) => ctx.db.get(productId)) as any).stock).toBe(1);
    const activities: any[] = await t.run((ctx: any) => ctx.db.query("orderActivityLog").collect());
    expect(activities.some(row => row.stage === "on_hold")).toBe(true);
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

  it("accepts the Admin drawer catalogue/custom payloads and clerkId customer", async () => {
    const t = convexTest(schema); const token = await staff(t, "admin", "drawer"); const productId = await product(t);
    await t.run((ctx: any) => ctx.db.insert("users", { clerkId: "clerk-drawer", email: "drawer@test.local", role: "client" }));
    const catalogue = await t.mutation(api.orders.createPOSOrder, { staffToken: token, userId: "clerk-drawer", customerDetails, items: [{ productId, quantity: 1, unitPriceOverride: 90 }], payInFull: true, paymentMethod: "transfer", idempotencyKey: "drawer-catalogue" });
    expect(catalogue).toBeTruthy();
    const custom = await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ name: "Custom appointment garment", unitPriceOverride: 120, quantity: 1, measurements: { chest: "40" } }], payInFull: false, amountPaid: 50, paymentMethod: "cash", idempotencyKey: "drawer-custom" });
    expect((await t.run((ctx: any) => ctx.db.get(custom)) as any).items[0].isCustomJob).toBe(true);
  });

  it("accepts the Appointment drawer custom-job payload", async () => {
    const t = convexTest(schema); const token = await staff(t, "admin", "appointment-drawer");
    const id = await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails, items: [{ name: "Kaftan", unitPriceOverride: 80, quantity: 1 }], payInFull: true, paymentMethod: "cash", idempotencyKey: "appointment-custom" });
    expect((await t.run((ctx: any) => ctx.db.get(id)) as any).items[0].name).toBe("Kaftan");
  });

  it("accepts the SalesPOS custom-job and base-SKU payloads", async () => {
    const t = convexTest(schema); const token = await staff(t, "sales", "sales-ui-payload"); const productId = await product(t, 2);
    const custom = await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails: { firstName: "UI", lastName: "Customer", email: "ui@example.test", phone: "0240000000" }, items: [{ productId: undefined, name: "Custom hem", unitPriceOverride: 35, quantity: 2, notes: "shorten sleeves", variantSku: undefined }], payInFull: true, amountPaid: undefined, paymentMethod: "cash", idempotencyKey: "sales-ui-custom" });
    expect((await t.run((ctx: any) => ctx.db.get(custom)) as any).items[0].isCustomJob).toBe(true);
    await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails: { firstName: "UI", lastName: "Customer", email: "ui@example.test", phone: "0240000000" }, items: [{ productId, name: undefined, unitPriceOverride: undefined, quantity: 1, notes: undefined, variantSku: undefined }], payInFull: true, amountPaid: undefined, paymentMethod: "cash", idempotencyKey: "sales-ui-base" });
    expect((await t.run((ctx: any) => ctx.db.get(productId)) as any).stock).toBe(1);
  });

  it("accepts the SalesPOS catalogue adjustment payload with a reason", async () => {
    const t = convexTest(schema); const token = await staff(t, "sales", "sales-ui-adjust"); const productId = await product(t);
    const orderId = await t.mutation(api.orders.createPOSOrder, { staffToken: token, customerDetails: { firstName: "UI", lastName: "Customer", email: "ui@example.test", phone: "0240000000" }, items: [{ productId, name: undefined, unitPriceOverride: 90, overrideReason: "Approved customer discount", quantity: 1, notes: undefined, variantSku: undefined }], payInFull: true, amountPaid: undefined, paymentMethod: "cash", idempotencyKey: "sales-ui-adjust" });
    const row: any = await t.run((ctx: any) => ctx.db.get(orderId));
    expect(row.items[0].priceAtPurchase).toBe(90);
    expect(row.hasPriceAdjustment).toBe(true);
  });
});
