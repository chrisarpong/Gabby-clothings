import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";

describe("Phase 1 Security Tests", () => {
  const originalEnv = process.env.ALLOW_DATA_WIPE;

  afterEach(() => {
    process.env.ALLOW_DATA_WIPE = originalEnv;
  });

  it("Task 1.1: wipeTestData rejects execution when ALLOW_DATA_WIPE is not true", async () => {
    delete process.env.ALLOW_DATA_WIPE;
    const t = convexTest(schema);

    await expect(
      t.mutation(internal.wipeData.wipeTestData, { confirmWipe: true })
    ).rejects.toThrow("ALLOW_DATA_WIPE is not set to 'true'");
  });

  it("Task 1.2: decrementStock works internally", async () => {
    const t = convexTest(schema);
    const productId = await t.run(async (ctx) => {
      return await ctx.db.insert("products", {
        name: "Test Shirt",
        slug: "test-shirt",
        category: "shirts",
        description: "A comfortable test shirt",
        type: "ready_to_wear",
        status: "active",
        basePrice: 100,
        stock: 10,
        images: ["test.jpg"],
      });
    });

    await t.mutation(internal.inventory.decrementStock, {
      items: [{ productId, quantity: 3 }],
    });

    const product = await t.run(async (ctx) => {
      return await ctx.db.get(productId);
    });
    expect(product?.stock).toBe(7);
  });
});


