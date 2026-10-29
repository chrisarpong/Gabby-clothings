import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { nextOrderNumber } from "./orderNumber";

describe("nextOrderNumber", () => {
  it("keeps GB-001 formatting and safely heals a numeric legacy string", async () => {
    const t = convexTest(schema);
    expect(await t.run(ctx => nextOrderNumber(ctx))).toBe("GB-001");
    await t.run(async ctx => {
      const setting = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "orderCounter")).first();
      await ctx.db.patch(setting!._id, { value: "15" });
    });
    expect(await t.run(ctx => nextOrderNumber(ctx))).toBe("GB-016");
  });

  it("rejects malformed and unsafe counters", async () => {
    const t = convexTest(schema);
    await t.run(ctx => ctx.db.insert("settings", { key: "orderCounter", value: "15abc" }));
    await expect(t.run(ctx => nextOrderNumber(ctx))).rejects.toThrow("Invalid order counter");

    const tooLarge = convexTest(schema);
    await tooLarge.run(ctx => ctx.db.insert("settings", { key: "orderCounter", value: Number.MAX_SAFE_INTEGER }));
    await expect(tooLarge.run(ctx => nextOrderNumber(ctx))).rejects.toThrow("Invalid order counter");
  });
});
