import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import type { StaffRole } from "./staffPermissions";

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function seedStaff(t: ReturnType<typeof convexTest>, role: StaffRole, name: string) {
  const staffToken = `${name}-token`;
  const staffId = await t.run(async ctx => {
    const id = await ctx.db.insert("staff", {
      name,
      email: `${name}@example.test`,
      role,
      passwordHash: "test-hash",
      passwordSalt: "test-salt",
      mustChangePassword: false,
      isActive: true,
      failedAttempts: 0,
      totpEnabled: true,
      createdAt: Date.now(),
    });
    await ctx.db.insert("staffSessions", {
      staffId: id,
      tokenHash: tokenHash(staffToken),
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
    return id;
  });
  return { staffId, staffToken };
}

describe("CEO SMS attempt visibility and failure audit", () => {
  it("returns recent attempts without emailKey or a full phone and rejects non-CEO staff", async () => {
    const t = convexTest(schema);
    const ceo = await seedStaff(t, "ceo", "sms-audit-ceo");
    const admin = await seedStaff(t, "admin", "sms-audit-admin");
    await t.run(async ctx => {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: "hashed-email-key",
        staffId: ceo.staffId,
        maskedPhone: "+233••••1234",
        outcome: "send_failed",
        via: "self_service",
        createdAt: Date.now(),
        failureCode: "http_error",
        providerStatus: 503,
        providerMessage: "Provider unavailable",
      });
    });

    const attempts = await t.query(api.staffSecurity.getRecentSmsAttempts, { staffToken: ceo.staffToken });
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      purpose: "password_reset", outcome: "send_failed", via: "self_service",
      maskedPhone: "+233••••1234", failureCode: "http_error",
      providerMessage: "Provider unavailable",
    });
    expect(attempts[0]).not.toHaveProperty("emailKey");
    expect(attempts[0]).not.toHaveProperty("phone");
    await expect(t.query(api.staffSecurity.getRecentSmsAttempts, { staffToken: admin.staffToken })).rejects.toThrow("FORBIDDEN");
  });

  it("persists provider failure details for self-service and CEO reset logs", async () => {
    const t = convexTest(schema);
    const ceo = await seedStaff(t, "ceo", "sms-failure-log");
    const resetIds = await t.run(async ctx => {
      const selfServiceReset = await ctx.db.insert("staffPasswordResets", {
        staffId: ceo.staffId, tempPasswordHash: "hash", tempPasswordSalt: "salt", expiresAt: Date.now() + 1000,
        attempts: 0, createdAt: Date.now(), via: "self_service",
      });
      const ceoReset = await ctx.db.insert("staffPasswordResets", {
        staffId: ceo.staffId, tempPasswordHash: "hash", tempPasswordSalt: "salt", expiresAt: Date.now() + 1000,
        attempts: 0, createdAt: Date.now(), via: "ceo",
      });
      return { selfServiceReset, ceoReset };
    });
    const common = {
      staffId: ceo.staffId,
      maskedPhone: "+233••••1234",
      failureCode: "http_error",
      providerStatus: 503,
      providerMessage: "Provider unavailable",
    };
    await t.mutation(internal.staffAuth.failPasswordResetSend, {
      resetId: resetIds.selfServiceReset, emailKey: "hashed-email-key", ...common,
    });
    await t.mutation(internal.staffAuth.failCeoPasswordResetSend, {
      resetId: resetIds.ceoReset, ...common,
    });
    const rows = await t.run(ctx => ctx.db.query("staffSmsLog").collect());
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toMatchObject({ outcome: "send_failed", failureCode: "http_error", providerStatus: 503, providerMessage: "Provider unavailable" });
    }
  });

  it("creates at most one generic CEO notification per hour without phone or message data", async () => {
    const t = convexTest(schema);
    await t.mutation(internal.smsAdmin.recordProviderFailure, { failureCode: "network" });
    await t.mutation(internal.smsAdmin.recordProviderFailure, { failureCode: "timeout" });
    const notifications = await t.run(ctx => ctx.db.query("staffNotifications").collect());
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      title: "SMS sending failed (network). Check the SMS card.",
      type: "sms_provider_failure",
      recipientRole: "ceo",
    });
    expect(notifications[0].title).not.toMatch(/\+\d|password|hello/i);
  });
});
