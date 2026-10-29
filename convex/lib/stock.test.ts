import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { apply, checkAvailability } from "./stock";

describe("shared stock checks and updates", () => {
  it("does not track made-to-measure items with custom or missing SKU", async () => {
    const t = convexTest(schema);
    await t.run(async ctx => {
      expect(await checkAvailability(ctx, [
        { productId: "missing-product", variantSku: "custom", quantity: 3 },
        { productId: "missing-product", quantity: 2 },
      ])).toEqual([]);
      expect(await apply(ctx, [
        { productId: "missing-product", variantSku: "custom", quantity: 3 },
        { productId: "missing-product", quantity: 2 },
      ])).toEqual([]);
    });
  });

  it("validates real SKUs and decrements the selected variant only", async () => {
    const t = convexTest(schema);
    const productId = await t.run(ctx => ctx.db.insert("products", {
      name: "Ready Shirt", slug: "ready-shirt", category: "shirts", description: "Test", type: "ready_to_wear", status: "active",
      basePrice: 20, stock: 100,
      variants: [
        { sku: "SHIRT-S", size: "S", color: "blue", stock: 7 },
        { sku: "SHIRT-M", size: "M", color: "blue", stock: 5 },
      ],
      images: [],
    }));

    await expect(t.run(ctx => checkAvailability(ctx, [{ productId, variantSku: "BAD-SKU", quantity: 1 }])))
      .rejects.toThrow("does not exist");
    expect(await t.run(ctx => apply(ctx, [{ productId, variantSku: "SHIRT-M", quantity: 2 }]))).toEqual([]);
    const product = await t.run(ctx => ctx.db.get(productId));
    expect(product?.variants?.find(variant => variant.sku === "SHIRT-M")?.stock).toBe(3);
    expect(product?.variants?.find(variant => variant.sku === "SHIRT-S")?.stock).toBe(7);
    expect(product?.stock).toBe(100);
  });

  it("decrements the product stock pool for a non-variant stocked SKU", async () => {
    const t = convexTest(schema);
    const productId = await t.run(ctx => ctx.db.insert("products", {
      name: "Single Stock Item", sku: "SINGLE-STOCK", slug: "single-stock-item", category: "accessories", description: "Test", type: "ready_to_wear", status: "active",
      basePrice: 20, stock: 4, images: [],
    }));
    await expect(t.run(ctx => apply(ctx, [{ productId, variantSku: "WRONG-SKU", quantity: 1 }]))).rejects.toThrow("does not exist");
    expect(await t.run(ctx => apply(ctx, [{ productId, variantSku: "SINGLE-STOCK", quantity: 3 }]))).toEqual([]);
    expect((await t.run(ctx => ctx.db.get(productId)))?.stock).toBe(1);
  });

  it("accounts for other active reservations and excludes the caller's own reservation", async () => {
    const t = convexTest(schema);
    const productId = await t.run(ctx => ctx.db.insert("products", {
      name: "Reserved Shirt", slug: "reserved-shirt", category: "shirts", description: "Test", type: "ready_to_wear", status: "active",
      basePrice: 20, variants: [{ sku: "SHIRT-M", size: "M", color: "blue", stock: 5 }], images: [],
    }));
    await t.run(ctx => ctx.db.insert("activeCheckouts", {
      userId: "other-customer", items: [{ productId, variantSku: "SHIRT-M", quantity: 3 }], expiresAt: Date.now() + 60_000,
    }));

    await t.run(async ctx => {
      expect(await checkAvailability(ctx, [{ productId, variantSku: "SHIRT-M", quantity: 3 }]))
        .toEqual([{ productId, productName: "Reserved Shirt", variantSku: "SHIRT-M", requested: 3, available: 2, shortage: 1 }]);
      expect(await checkAvailability(ctx, [{ productId, variantSku: "SHIRT-M", quantity: 3 }], { excludeUserId: "other-customer" }))
        .toEqual([]);
    });
  });

  it("returns shortages without decrementing or clamping inventory", async () => {
    const t = convexTest(schema);
    const productId = await t.run(ctx => ctx.db.insert("products", {
      name: "Low Stock Shirt", slug: "low-stock-shirt", category: "shirts", description: "Test", type: "ready_to_wear", status: "active",
      basePrice: 20, variants: [{ sku: "SHIRT-M", size: "M", color: "blue", stock: 1 }], images: [],
    }));
    const shortages = await t.run(ctx => apply(ctx, [{ productId, variantSku: "SHIRT-M", quantity: 3 }]));
    expect(shortages).toEqual([{ productId, productName: "Low Stock Shirt", variantSku: "SHIRT-M", requested: 3, available: 1, shortage: 2 }]);
    expect((await t.run(ctx => ctx.db.get(productId)))?.variants?.[0].stock).toBe(1);
  });
});
