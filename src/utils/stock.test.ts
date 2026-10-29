import { describe, expect, it } from "vitest";
import { getAvailableStock } from "./stock";

describe("getAvailableStock", () => {
  it("returns untracked capacity for custom lines", () => expect(getAvailableStock({ product: { variants: [{ sku: "S", stock: 2 }] }, variantSku: "custom" })).toBe(99));
  it("uses selected variant stock and rejects missing variants", () => {
    const product = { variants: [{ sku: "S", stock: 3 }] };
    expect(getAvailableStock({ product, variantSku: "S" })).toBe(3);
    expect(getAvailableStock({ product })).toBe(0);
  });
  it("uses base SKU stock for products without variants", () => {
    const product = { sku: "BASE", stock: 7 };
    expect(getAvailableStock({ product, variantSku: undefined })).toBe(7);
    expect(getAvailableStock({ product, variantSku: "BASE" })).toBe(7);
    expect(getAvailableStock({ product, variantSku: "other" })).toBe(0);
  });
});
