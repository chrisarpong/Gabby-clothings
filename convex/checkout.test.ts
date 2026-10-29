import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";

async function seedProduct(t: any, stock = 5) {
  return await t.run(async (ctx: any) => await ctx.db.insert("products", {
    name: "Test Shirt", slug: `test-shirt-${stock}-${Date.now()}`, category: "shirts",
    description: "test", type: "ready_to_wear", status: "active", basePrice: 100,
    sku: "TEST-SKU", stock, images: [],
  }));
}

const address = { street: "123 Main Street", city: "Accra", region: "Greater Accra", postalCode: "00233", country: "Ghana" };

describe("server checkout money core", () => {
  it("rejects negative, zero, fractional, and huge quantities", async () => {
    for (const quantity of [-1, 0, 1.5, 21]) {
      const t = convexTest(schema).withIdentity({ subject: `checkout-${quantity}` });
      const productId = await seedProduct(t);
      await expect(t.mutation(api.checkout.createCheckoutSession, {
        items: [{ productId, variantSku: "TEST-SKU", quantity, measurements: undefined }],
        shippingAddress: address,
        customerDetails: { firstName: "Test", lastName: "Buyer", email: "buyer@example.test" },
      })).rejects.toThrow();
    }
  });

  it("uses server product pricing and rejects client-controlled price fields", async () => {
    const t = convexTest(schema).withIdentity({ subject: "checkout-price" });
    const productId = await seedProduct(t);
    const result = await t.mutation(api.checkout.createCheckoutSession, {
      items: [{ productId, variantSku: "TEST-SKU", quantity: 1 }],
      shippingAddress: address,
      customerDetails: { firstName: "Test", lastName: "Buyer", email: "buyer@example.test" },
    });
    expect(result.amountPesewas).toBe(15000);
    await expect(t.mutation(api.checkout.createCheckoutSession, {
      items: [{ productId, variantSku: "TEST-SKU", quantity: 1, price: 1 } as any],
      shippingAddress: address,
      customerDetails: { firstName: "Test", lastName: "Buyer", email: "buyer@example.test" },
    })).rejects.toThrow();
  });

  it("finalization is idempotent and decrements stock once", async () => {
    const t = convexTest(schema);
    const productId = await seedProduct(t, 5);
    const reference = "GB-IDEMPOTENT-REF";
    await t.run(async (ctx) => {
      await ctx.db.insert("checkoutSessions", {
        reference, userId: "checkout-user", customerDetails: { firstName: "Test", lastName: "Buyer", email: "buyer@example.test" },
        items: [{ productId, variantSku: "TEST-SKU", quantity: 2, unitPesewas: 10000, productName: "Test Shirt" }],
        shippingAddress: address, subtotalPesewas: 20000, discountPesewas: 0, shippingPesewas: 50,
        expectedAmountPesewas: 20050, currency: "GHS", status: "pending", createdAt: Date.now(),
      });
    });
    const first = await t.mutation(internal.checkout.finalizeCheckoutPaid, { reference, amountPesewas: 20050, currency: "GHS", source: "test" });
    const second = await t.mutation(internal.checkout.finalizeCheckoutPaid, { reference, amountPesewas: 20050, currency: "GHS", source: "test" });
    expect(first?.orderId).toBe(second?.orderId);
    const product = await t.run(async (ctx: any) => await ctx.db.get(productId));
    expect((product as any)?.stock).toBe(3);
    const orders = await t.run(async (ctx) => await ctx.db.query("orders").collect());
    expect(orders).toHaveLength(1);
  });

  it("puts oversold paid checkout on hold and records an issue", async () => {
    const t = convexTest(schema);
    const productId = await seedProduct(t, 1);
    const reference = "GB-OVERSOLD-REF";
    await t.run(async (ctx) => {
      await ctx.db.insert("checkoutSessions", {
        reference, userId: "checkout-user", customerDetails: { firstName: "Test", lastName: "Buyer", email: "buyer@example.test" },
        items: [{ productId, variantSku: "TEST-SKU", quantity: 2, unitPesewas: 10000, productName: "Test Shirt" }],
        shippingAddress: address, subtotalPesewas: 20000, discountPesewas: 0, shippingPesewas: 0,
        expectedAmountPesewas: 20000, currency: "GHS", status: "pending", createdAt: Date.now(),
      });
    });
    const result = await t.mutation(internal.checkout.finalizeCheckoutPaid, { reference, amountPesewas: 20000, currency: "GHS", source: "test" });
    const order = await t.run(async (ctx) => result ? await ctx.db.get(result.orderId) : null);
    expect(order?.status).toBe("on_hold");
    const issues = await t.run(async (ctx) => await ctx.db.query("paymentIssues").collect());
    expect(issues.some(issue => issue.kind === "oversold")).toBe(true);
  });
});
