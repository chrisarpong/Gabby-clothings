import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

describe("customer order reference lookup", () => {
  it("does not return another customer's order", async () => {
    const t = convexTest(schema).withIdentity({ subject: "customer-a" });
    await t.run(async (ctx) => {
      await ctx.db.insert("orders", {
        userId: "customer-b",
        items: [],
        totalAmount: 100,
        status: "paid",
        paystackReference: "REF-OTHER",
      });
    });
    expect(await t.query(api.orders.getMyOrderByReference, { reference: "REF-OTHER" })).toBeNull();
  });
});
