import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";

describe("development team seed", () => {
  it("refuses unless explicitly enabled and creates all three roles when enabled", async () => {
    delete process.env.ALLOW_DEV_SEED;
    const blocked = convexTest(schema);
    await expect(blocked.action(internal.staffAuthNode.seedDevTeam, {})).rejects.toThrow("Development seed is disabled");

    process.env.ALLOW_DEV_SEED = "true";
    const t = convexTest(schema);
    const result = await t.action(internal.staffAuthNode.seedDevTeam, {});
    expect(result.map(row => row.role)).toEqual(["admin", "designer", "sales"]);
    expect(result.every(row => row.password.length === 20)).toBe(true);
    expect(await t.run(ctx => ctx.db.query("staff").collect())).toHaveLength(3);
    const rerun = await t.action(internal.staffAuthNode.seedDevTeam, {});
    expect(rerun).toEqual([]);
    expect(await t.run(ctx => ctx.db.query("staff").collect())).toHaveLength(3);
    delete process.env.ALLOW_DEV_SEED;
  });
});
