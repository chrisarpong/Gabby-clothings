import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";

describe("bounded cleanup mutations", () => {
  it("deletes only stale pending checkout sessions and rate limits", async () => {
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      const old = Date.now() - 8 * 24 * 60 * 60 * 1000;
      await ctx.db.insert("checkoutSessions", { reference: "old", userId: "u", customerDetails: { email: "a@b.test", firstName: "A", lastName: "B" }, items: [], shippingAddress: { street: "123 Main", city: "Accra", region: "GA", postalCode: "1", country: "Ghana" }, subtotalPesewas: 0, discountPesewas: 0, shippingPesewas: 0, expectedAmountPesewas: 0, currency: "GHS", status: "pending", createdAt: old });
      await ctx.db.insert("checkoutSessions", { reference: "paid", userId: "u", customerDetails: { email: "a@b.test", firstName: "A", lastName: "B" }, items: [], shippingAddress: { street: "123 Main", city: "Accra", region: "GA", postalCode: "1", country: "Ghana" }, subtotalPesewas: 0, discountPesewas: 0, shippingPesewas: 0, expectedAmountPesewas: 0, currency: "GHS", status: "paid", createdAt: old });
      await ctx.db.insert("rateLimits", { identifier: "old", endpoint: "x", count: 1, lastAttempt: old });
      await ctx.db.insert("rateLimits", { identifier: "new", endpoint: "x", count: 1, lastAttempt: Date.now() });
    });
    await t.mutation(internal.maintenance.cleanupPendingCheckoutSessions, {});
    await t.mutation(internal.maintenance.cleanupRateLimits, {});
    const remaining = await t.run(async (ctx) => ({ sessions: await ctx.db.query("checkoutSessions").collect(), limits: await ctx.db.query("rateLimits").collect() }));
    expect(remaining.sessions.map(row => row.reference)).toEqual(["paid"]);
    expect(remaining.limits.map(row => row.identifier)).toEqual(["new"]);
  });
});
