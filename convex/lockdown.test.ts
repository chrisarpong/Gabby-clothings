import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";

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
});

