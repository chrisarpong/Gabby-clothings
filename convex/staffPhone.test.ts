import { describe, it, expect, beforeAll } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import * as crypto from "crypto";

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

describe("staff phone management", () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
  });

  it("enforces CEO-only updates, validates format, audits masked values, and masks output", async () => {
    const t = convexTest(schema);

    let ceoId: any;
    let adminId: any;
    let targetStaffId: any;
    const ceoToken = "ceo-phone-test-token";
    const adminToken = "admin-phone-test-token";
    const targetToken = "target-staff-test-token";

    await t.run(async (ctx) => {
      ceoId = await ctx.db.insert("staff", {
        name: "CEO",
        email: "ceo-phone@test.local",
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
        email: "admin-phone@test.local",
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

      targetStaffId = await ctx.db.insert("staff", {
        name: "Sales Agent",
        email: "agent@test.local",
        role: "sales",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: targetStaffId,
        tokenHash: tokenHash(targetToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
    });

    // 1. Admin cannot update phone
    await expect(
      t.mutation(api.staffAuth.updateStaffPhone, {
        staffToken: adminToken,
        targetStaffId,
        phone: "0241234567",
      })
    ).rejects.toThrow();

    // 2. Invalid phone format rejected
    await expect(
      t.mutation(api.staffAuth.updateStaffPhone, {
        staffToken: ceoToken,
        targetStaffId,
        phone: "123456",
      })
    ).rejects.toThrow("Enter a valid Ghana phone number.");

    // 3. CEO updates with valid phone
    const updateRes = await t.mutation(api.staffAuth.updateStaffPhone, {
      staffToken: ceoToken,
      targetStaffId,
      phone: "024 123 4567",
    });
    expect(updateRes.phone).toBe("+233 24 *** **67");

    // 4. Verify admin log is masked
    const log: any = await t.run(async (ctx) => {
      return await ctx.db.query("adminLogs").order("desc").first();
    });
    expect(log.action).toBe("Updated Staff Phone");
    expect(log.details).toContain("+233 24 *** **67");
    expect(log.details).not.toContain("+233241234567");

    // 5. CEO sees masked phone in listStaff
    const ceoStaffList = await t.query(api.staffAuth.listStaff, { staffToken: ceoToken });
    const targetInCeoView = ceoStaffList.find((s: any) => s._id === targetStaffId);
    expect(targetInCeoView?.phone).toBe("+233 24 *** **67");

    // 6. Target staff (sales) calling getStaffProfile never sees raw or masked phone
    const targetProfile = await t.query(api.staffAuth.getStaffProfile, { staffToken: targetToken });
    expect(targetProfile?.phone).toBeUndefined();
  });
});
