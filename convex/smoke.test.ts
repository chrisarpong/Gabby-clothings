import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

describe("convex-test smoke", () => {
  it("public query products.getAll returns empty array initially", async () => {
    const t = convexTest(schema);
    const products = await t.query(api.products.getAll, {});
    expect(products).toEqual([]);
  });
});

