import { describe, it, expect, beforeAll } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import * as crypto from "crypto";

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

describe("staff security settings (Task 5)", () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
  });

  it("enforces CEO-only access, applies defaults, clamps daily cap, and audits changes", async () => {
    const t = convexTest(schema);

    let ceoId: any;
    let adminId: any;
    const ceoToken = "ceo-sec-token";
    const adminToken = "admin-sec-token";

    await t.run(async (ctx) => {
      ceoId = await ctx.db.insert("staff", {
        name: "CEO",
        email: "ceo-sec@test.local",
        role: "ceo",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: ceoId,
        tokenHash: tokenHash(ceoToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });

      adminId = await ctx.db.insert("staff", {
        name: "Admin",
        email: "admin-sec@test.local",
        role: "admin",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: adminId,
        tokenHash: tokenHash(adminToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
    });

    // 1. Non-CEO rejected from reading or updating
    await expect(t.query(api.staffSecurity.getSmsSettings, { staffToken: adminToken })).rejects.toThrow();
    await expect(
      t.mutation(api.staffSecurity.updateSmsSettings, {
        staffToken: adminToken,
        smsResetEnabled: true,
        smsResetAllowedRoles: ["designer"],
        smsDailyCap: 25,
      })
    ).rejects.toThrow();

    // 2. CEO reads defaults
    const defaults = await t.query(api.staffSecurity.getSmsSettings, { staffToken: ceoToken });
    expect(defaults.smsResetEnabled).toBe(false);
    expect(defaults.smsResetAllowedRoles).toEqual(["designer", "sales"]);
    expect(defaults.smsDailyCap).toBe(30);
    expect(defaults.sentToday).toBe(0);
    expect(defaults.last7Days).toBe(0);

    // 3. CEO updates with out-of-bounds daily cap (should clamp to 5..200)
    const updated = await t.mutation(api.staffSecurity.updateSmsSettings, {
      staffToken: ceoToken,
      smsResetEnabled: true,
      smsResetAllowedRoles: ["designer", "sales", "admin", "invalid_role"],
      smsDailyCap: 500, // over 200 -> clamps to 200
    });
    expect(updated.smsResetEnabled).toBe(true);
    expect(updated.smsDailyCap).toBe(200);
    expect(updated.smsResetAllowedRoles).toEqual(["designer", "sales", "admin"]);

    // 4. Clamping lower bound
    const clampedLow = await t.mutation(api.staffSecurity.updateSmsSettings, {
      staffToken: ceoToken,
      smsResetEnabled: true,
      smsResetAllowedRoles: ["designer"],
      smsDailyCap: 1, // under 5 -> clamps to 5
    });
    expect(clampedLow.smsDailyCap).toBe(5);

    // 5. Audit log verified
    const log: any = await t.run(async (ctx) => {
      return await ctx.db.query("adminLogs").order("desc").first();
    });
    expect(log.action).toBe("Updated SMS Reset Settings");
    expect(log.userId).toBe(ceoId);
    expect(log.details).toContain("cap=5");
  });
});

