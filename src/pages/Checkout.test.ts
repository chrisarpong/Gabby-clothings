import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("checkout Paystack configuration", () => {
  it("passes the server checkout reference, amount, and email", () => {
    const source = readFileSync(new URL("./Checkout.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/reference:\s*checkoutSession\?\.reference/);
    expect(source).toMatch(/amount:\s*checkoutSession\?\.amountPesewas/);
    expect(source).toMatch(/email:\s*checkoutSession\?\.email/);
  });
});
