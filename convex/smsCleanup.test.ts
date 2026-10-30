import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";

describe("SMS and Password Reset Retention Cleanup (Task 10)", () => {
  it("deletes resets >7d, logs >30d, and dev outbox >1d in batches of up to 500 while preserving recent rows", async () => {
    const t = convexTest(schema);

    const now = Date.now();
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
    const thirtyOneDaysAgo = now - 31 * 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    let dummyStaffId: any;
    let recentResetId: any;
    let oldResetId1: any;
    let oldResetId2: any;

    let recentLogId: any;
    let oldLogId1: any;
    let oldLogId2: any;

    let recentOutboxId: any;
    let oldOutboxId1: any;
    let oldOutboxId2: any;

    await t.run(async (ctx) => {
      dummyStaffId = await ctx.db.insert("staff", {
        name: "Test User",
        email: "cleanup@test.local",
        role: "designer",
        passwordHash: "hash",
        passwordSalt: "salt",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: now,
      });

      // staffPasswordResets
      oldResetId1 = await ctx.db.insert("staffPasswordResets", {
        staffId: dummyStaffId,
        tempPasswordHash: "h1",
        tempPasswordSalt: "s1",
        expiresAt: eightDaysAgo + 900000,
        attempts: 0,
        createdAt: eightDaysAgo,
        via: "self_service",
      });
      oldResetId2 = await ctx.db.insert("staffPasswordResets", {
        staffId: dummyStaffId,
        tempPasswordHash: "h2",
        tempPasswordSalt: "s2",
        expiresAt: eightDaysAgo + 900000,
        attempts: 1,
        createdAt: eightDaysAgo + 1000,
        via: "ceo",
      });
      recentResetId = await ctx.db.insert("staffPasswordResets", {
        staffId: dummyStaffId,
        tempPasswordHash: "h3",
        tempPasswordSalt: "s3",
        expiresAt: now + 900000,
        attempts: 0,
        createdAt: now,
        via: "self_service",
      });

      // staffSmsLog
      oldLogId1 = await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: "key1",
        outcome: "sent",
        via: "self_service",
        createdAt: thirtyOneDaysAgo,
      });
      oldLogId2 = await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: "key2",
        outcome: "blocked_rate_limit",
        via: "self_service",
        createdAt: thirtyOneDaysAgo + 5000,
      });
      recentLogId = await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: "key3",
        outcome: "sent",
        via: "ceo",
        createdAt: now,
      });

      // devSmsOutbox
      oldOutboxId1 = await ctx.db.insert("devSmsOutbox", {
        phone: "+233241234567",
        message: "Old dev message 1",
        kind: "otp",
        createdAt: twoDaysAgo,
      });
      oldOutboxId2 = await ctx.db.insert("devSmsOutbox", {
        phone: "+233241234568",
        message: "Old dev message 2",
        kind: "notice",
        createdAt: twoDaysAgo + 10000,
      });
      recentOutboxId = await ctx.db.insert("devSmsOutbox", {
        phone: "+233241234569",
        message: "Recent dev message",
        kind: "otp",
        createdAt: now,
      });
    });

    // Execute cleanup
    const result = await t.mutation(internal.smsCleanup.cleanupSmsRecords, {});
    expect(result).toEqual({
      deletedResets: 2,
      deletedLogs: 2,
      deletedDevOutbox: 2,
    });

    // Verify database state
    await t.run(async (ctx) => {
      // Old items deleted
      expect(await ctx.db.get(oldResetId1)).toBeNull();
      expect(await ctx.db.get(oldResetId2)).toBeNull();
      expect(await ctx.db.get(oldLogId1)).toBeNull();
      expect(await ctx.db.get(oldLogId2)).toBeNull();
      expect(await ctx.db.get(oldOutboxId1)).toBeNull();
      expect(await ctx.db.get(oldOutboxId2)).toBeNull();

      // Recent items retained
      expect(await ctx.db.get(recentResetId)).not.toBeNull();
      expect(await ctx.db.get(recentLogId)).not.toBeNull();
      expect(await ctx.db.get(recentOutboxId)).not.toBeNull();
    });
  });
});

