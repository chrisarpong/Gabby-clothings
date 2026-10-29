import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

describe("catalog product lookup", () => {
  it("returns active catalog products and falls back for an unknown slug", async () => {
    const t = convexTest(schema);
    const catalog = await t.run((ctx: any) => ctx.db.insert("catalogs", { name: "Kaftans", slug: "kaftans", status: "active" }));
    await t.run((ctx: any) => ctx.db.insert("products", { name: "Catalog Kaftan", category: "other", basePrice: 100, description: "x", images: [], status: "active", type: "physical", catalogIds: [catalog] }));
    await t.run((ctx: any) => ctx.db.insert("products", { name: "Archived", category: "other", basePrice: 100, description: "x", images: [], status: "archived", type: "physical", catalogIds: [catalog] }));
    expect(await t.query(api.products.getByCatalogSlug, { slug: "kaftans" })).toHaveLength(1);
    expect(await t.query(api.products.getByCatalogSlug, { slug: "missing" })).toBeNull();
  });
  it("limits search results to 50 active products", async () => {
    const t = convexTest(schema);
    await t.run(async (ctx: any) => { for (let i = 0; i < 55; i++) await ctx.db.insert("products", { name: `Kaftan ${i}`, category: "kaftans", basePrice: 1, description: "search", images: [], status: "active", type: "physical" }); });
    expect(await t.query(api.products.searchProducts, { q: "kaftan" })).toHaveLength(50);
  });
});
