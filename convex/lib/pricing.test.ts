import { describe, expect, it } from "vitest";
import {
  computeTotals,
  fromPesewas,
  lineUnitPrice,
  mergeAndValidateCartLines,
  toPesewas,
  validateQuantity,
} from "./pricing";

describe("money pricing in pesewas", () => {
  it("converts GHS to and from integer pesewas with rounding", () => {
    expect(toPesewas(12.345)).toBe(1235);
    expect(toPesewas(0)).toBe(0);
    expect(fromPesewas(1235)).toBe(12.35);
    expect(() => toPesewas(Number.NaN)).toThrow("finite");
    expect(() => toPesewas(Number.MAX_SAFE_INTEGER)).toThrow("supported range");
  });

  it("uses the base price customers see, including when a variant has priceTotal", () => {
    expect(lineUnitPrice({ basePrice: 125.505, variants: [{ sku: "M", priceTotal: 200 } ] }, "M")).toBe(12551);
    expect(lineUnitPrice({ basePrice: 125.505 }, "custom")).toBe(12551);
    expect(() => lineUnitPrice({ basePrice: -1 })).toThrow("non-negative");
  });

  it("rejects negative, zero, fractional, and oversized quantities", () => {
    for (const quantity of [-1, 0, 1.5, 21, 1_000_000_000]) {
      expect(() => validateQuantity(quantity)).toThrow("integer from 1 to 20");
    }
    expect(validateQuantity(1)).toBe(1);
    expect(validateQuantity(20)).toBe(20);
  });

  it("merges duplicate product and variant lines before quantity validation", () => {
    const merged = mergeAndValidateCartLines([
      { productId: "p1", variantSku: "M", quantity: 2 },
      { productId: "p1", variantSku: "M", quantity: 3 },
      { productId: "p1", variantSku: "L", quantity: 1 },
    ]);
    expect(merged.map(line => line.quantity)).toEqual([5, 1]);
    expect(() => mergeAndValidateCartLines([
      { productId: "p1", variantSku: "M", quantity: 20 },
      { productId: "p1", variantSku: "M", quantity: 1 },
    ])).toThrow("integer from 1 to 20");
    expect(() => mergeAndValidateCartLines(Array.from({ length: 31 }, (_, i) => ({ productId: `p${i}`, quantity: 1 }))))
      .toThrow("at most 30");
  });

  it("computes multiple lines and rounds only at the pesewa boundary", () => {
    expect(computeTotals({
      lines: [{ unitPesewas: 101, quantity: 3 }, { unitPesewas: 250, quantity: 2 }],
      shippingRatePesewas: 500,
    })).toEqual({ subtotal: 803, discount: 0, shipping: 500, total: 1303 });
  });

  it("clamps fixed and percentage discounts to the subtotal", () => {
    expect(computeTotals({
      lines: [{ unitPesewas: 5000, quantity: 1 }], shippingRatePesewas: 0,
      promo: { discountType: "fixed", discountValue: 100 },
    })).toEqual({ subtotal: 5000, discount: 5000, shipping: 0, total: 0 });
    expect(computeTotals({
      lines: [{ unitPesewas: 333, quantity: 1 }], shippingRatePesewas: 0,
      promo: { discountType: "percentage", discountValue: 50 },
    })).toEqual({ subtotal: 333, discount: 167, shipping: 0, total: 166 });
    expect(() => computeTotals({
      lines: [{ unitPesewas: 100, quantity: 1 }], shippingRatePesewas: 0,
      promo: { discountType: "percentage", discountValue: 100.01 },
    })).toThrow("between 0 and 100");
  });

  it("enforces promo minimum and free-shipping threshold boundary", () => {
    const below = computeTotals({
      lines: [{ unitPesewas: 9999, quantity: 1 }], shippingRatePesewas: 1000,
      freeShippingThresholdPesewas: 10000,
    });
    const at = computeTotals({
      lines: [{ unitPesewas: 10000, quantity: 1 }], shippingRatePesewas: 1000,
      freeShippingThresholdPesewas: 10000,
      promo: { discountType: "fixed", discountValue: 10, minOrderAmountPesewas: 10000 },
    });
    expect(below.shipping).toBe(1000);
    expect(at).toEqual({ subtotal: 10000, discount: 1000, shipping: 0, total: 9000 });
    expect(() => computeTotals({
      lines: [{ unitPesewas: 9999, quantity: 1 }], shippingRatePesewas: 0,
      promo: { discountType: "fixed", discountValue: 1, minOrderAmountPesewas: 10000 },
    })).toThrow("minimum order");
  });
});
