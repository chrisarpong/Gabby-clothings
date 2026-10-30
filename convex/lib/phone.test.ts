import { describe, expect, it } from "vitest";
import { maskPhone, normalizeGhanaPhone, toBmsLocal } from "./phone";

describe("Ghana phone normalization", () => {
  it("accepts common formats", () => {
    for (const value of ["024 123 4567", "0241234567", "233241234567", "+233 24 123 4567", "024-123-4567"]) expect(normalizeGhanaPhone(value)).toBe("+233241234567");
    expect(maskPhone("+233241234567")).toBe("+233 24 *** **67");
    expect(toBmsLocal("+233241234567")).toBe("0241234567");
  });
  it("rejects invalid and foreign numbers", () => {
    for (const value of ["", "12345", "+2348012345678", "+233141234567", "+23324123456x"]) expect(() => normalizeGhanaPhone(value)).toThrow();
  });
});
