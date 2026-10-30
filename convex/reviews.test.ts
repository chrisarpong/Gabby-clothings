import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

describe("verified purchase reviews", () => {
  it("marks paid and partial purchases verified, but not unpaid or cancelled purchases", async () => {
    const t = convexTest(schema).withIdentity({ subject: "reviewer" });
    let productId: any;
    let paidProductId: any;
    await t.run(async (ctx) => {
      productId = await ctx.db.insert("products", { name: "Reviewed", slug: "reviewed", category: "test", description: "x", type: "ready_to_wear", status: "active", basePrice: 10, sku: "REV-SKU", images: [] });
      paidProductId = await ctx.db.insert("products", { name: "Paid", slug: "paid", category: "test", description: "x", type: "ready_to_wear", status: "active", basePrice: 10, sku: "PAID-SKU", images: [] });
      await ctx.db.insert("orders", { userId: "reviewer", items: [{ productId, quantity: 1, priceAtPurchase: 10 }], totalAmount: 10, status: "processing", paymentStatus: "paid" });
      await ctx.db.insert("orders", { userId: "reviewer", items: [{ productId: paidProductId, quantity: 1, priceAtPurchase: 10 }], totalAmount: 10, status: "processing", paymentStatus: "partial" });
    });
    await t.mutation(api.reviews.addReview, { productId, rating: 5, comment: "Great" });
    await t.mutation(api.reviews.addReview, { productId: paidProductId, rating: 4, comment: "Good" });
    const reviews = await t.run(ctx => ctx.db.query("reviews").collect());
    expect(reviews.map(review => review.isVerifiedPurchase)).toEqual([true, true]);

    const otherProduct = await t.run(ctx => ctx.db.insert("products", { name: "Unpaid", slug: "unpaid", category: "test", description: "x", type: "ready_to_wear", status: "active", basePrice: 10, sku: "UNPAID-SKU", images: [] }));
    await t.run(async (ctx) => {
      await ctx.db.insert("orders", { userId: "reviewer", items: [{ productId: otherProduct, quantity: 1, priceAtPurchase: 10 }], totalAmount: 10, status: "cancelled", paymentStatus: "paid" });
    });
    await t.mutation(api.reviews.addReview, { productId: otherProduct, rating: 3, comment: "Okay" });
    expect((await t.run(ctx => ctx.db.query("reviews").collect())).find(review => review.productId === otherProduct)?.isVerifiedPurchase).toBe(false);
  });
});
