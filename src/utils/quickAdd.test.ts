import { describe, expect, it } from "vitest";
import { getQuickAddAction } from "./quickAdd";
describe("quick add", () => {
  it("adds non-variant ready-to-wear by its base SKU", () => expect(getQuickAddAction({ type: "ready_to_wear", sku: "BASE" })).toEqual({ kind: "add", variantSku: "BASE" }));
  it("routes variants, showcase templates, and missing SKUs to detail", () => {
    expect(getQuickAddAction({ type: "ready_to_wear", sku: "BASE", variants: [{ sku: "S" }] })).toEqual({ kind: "navigate" });
    expect(getQuickAddAction({ type: "showcase_template", sku: "X" })).toEqual({ kind: "navigate" });
    expect(getQuickAddAction({ type: "ready_to_wear" })).toEqual({ kind: "navigate" });
  });
});
