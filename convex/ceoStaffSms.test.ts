import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { clearMockSentMessages, getMockSentMessages } from "./lib/sms";
import * as crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

describe("CEO SMS Password Reset & Staff Controls (Task 8)", () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
  });

  beforeEach(() => {
    clearMockSentMessages();
    process.env.SMS_PROVIDER = "mock";
  });

  it("enforces CEO authorization, clamps settings, respects daily cap and per-target limits, and never returns the password", async () => {
    const t = convexTest(schema);

    // 1. Create CEO and Admin staff
    const ceoToken = "ceo-token-1234567890";
    const adminToken = "admin-token-1234567890";
    let ceoId: any;
    let adminId: any;
    let designerId: any;

    await t.run(async (ctx) => {
      ceoId = await ctx.db.insert("staff", {
        name: "CEO Person",
        email: "ceo@test.local",
        role: "ceo",
        passwordHash: "hash",
        passwordSalt: "salt",
        phone: "+233241111111",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: ceoId,
        tokenHash: hashToken(ceoToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000,
      });

      adminId = await ctx.db.insert("staff", {
        name: "Admin Person",
        email: "admin@test.local",
        role: "admin",
        passwordHash: "hash",
        passwordSalt: "salt",
        phone: "+233242222222",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: adminId,
        tokenHash: hashToken(adminToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000,
      });

      designerId = await ctx.db.insert("staff", {
        name: "Designer Person",
        email: "designer@test.local",
        role: "designer",
        passwordHash: "orig_hash",
        passwordSalt: "orig_salt",
        phone: "+233243333333",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
    });

    // 2. Non-CEO rejected from updateSmsSettings
    await expect(
      t.mutation(api.staffSecurity.updateSmsSettings, {
        staffToken: adminToken,
        smsResetEnabled: true,
        smsResetAllowedRoles: ["designer", "sales"],
        smsDailyCap: 50,
      })
    ).rejects.toThrow("Unauthorized: Requires team_management");

    // Also test a staff with team_management if not CEO (though in our system only CEO has team_management)
    // 3. CEO updates settings & clamps cap
    await t.mutation(api.staffSecurity.updateSmsSettings, {
      staffToken: ceoToken,
      smsResetEnabled: true,
      smsResetAllowedRoles: ["designer", "sales", "invalid_role"],
      smsDailyCap: 500, // Should be clamped to 200
    });

    const settingsAfterHigh: any = await t.query(api.staffSecurity.getSmsSettings, {
      staffToken: ceoToken,
    });
    expect(settingsAfterHigh.smsDailyCap).toBe(200);
    expect(settingsAfterHigh.smsResetAllowedRoles).toEqual(["designer", "sales"]);

    await t.mutation(api.staffSecurity.updateSmsSettings, {
      staffToken: ceoToken,
      smsResetEnabled: true,
      smsResetAllowedRoles: ["designer", "sales"],
      smsDailyCap: 2, // Should be clamped to 5
    });
    const settingsAfterLow: any = await t.query(api.staffSecurity.getSmsSettings, {
      staffToken: ceoToken,
    });
    expect(settingsAfterLow.smsDailyCap).toBe(5);

    // 4. Non-CEO rejected from ceoSendStaffPasswordSms
    await expect(
      t.action(api.staffAuthNode.ceoSendStaffPasswordSms, {
        staffToken: adminToken,
        targetStaffId: designerId,
      })
    ).rejects.toThrow("Unauthorized: Requires team_management");

    // 5. Target role not allowed
    await expect(
      t.action(api.staffAuthNode.ceoSendStaffPasswordSms, {
        staffToken: ceoToken,
        targetStaffId: adminId, // admin is not in allowed roles
      })
    ).rejects.toThrow("SMS reset is not enabled for role");

    // 6. Target has no phone
    let noPhoneId: any;
    await t.run(async (ctx) => {
      noPhoneId = await ctx.db.insert("staff", {
        name: "No Phone Sales",
        email: "sales-nophone@test.local",
        role: "sales",
        passwordHash: "hash",
        passwordSalt: "salt",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
    });
    await expect(
      t.action(api.staffAuthNode.ceoSendStaffPasswordSms, {
        staffToken: ceoToken,
        targetStaffId: noPhoneId,
      })
    ).rejects.toThrow("Staff member has no phone number registered.");

    // 7. Successful CEO dispatch
    const sendRes = await t.action(api.staffAuthNode.ceoSendStaffPasswordSms, {
      staffToken: ceoToken,
      targetStaffId: designerId,
    });
    expect(sendRes.ok).toBe(true);
    expect(sendRes.maskedPhone).toBe("+233 24 *** **33");
    // Password must NEVER be in return value
    expect((sendRes as any).password).toBeUndefined();
    expect((sendRes as any).tempPassword).toBeUndefined();

    // Verify SMS sent
    const sentMsgs = getMockSentMessages();
    expect(sentMsgs.length).toBe(1);
    expect(sentMsgs[0].to).toBe("+233243333333");
    expect(sentMsgs[0].kind).toBe("otp");

    // Verify reset record created with via: "ceo"
    const resetDoc: any = await t.run(async (ctx) => {
      return await ctx.db
        .query("staffPasswordResets")
        .withIndex("by_staffId", q => q.eq("staffId", designerId))
        .first();
    });
    expect(resetDoc.via).toBe("ceo");
    expect(resetDoc.voidedAt).toBeUndefined();

    // 8. Per-target 60s cooldown
    await expect(
      t.action(api.staffAuthNode.ceoSendStaffPasswordSms, {
        staffToken: ceoToken,
        targetStaffId: designerId,
      })
    ).rejects.toThrow("Please wait 60 seconds before sending another SMS to this staff member.");

    // 9. CEO send obeys global daily cap
    // Set daily cap to 1 in settings (or simulate hitting cap)
    await t.run(async (ctx) => {
      // Artificially insert sent logs up to cap (which is 5)
      const now = Date.now();
      for (let i = 0; i < 4; i++) {
        await ctx.db.insert("staffSmsLog", {
          purpose: "password_reset",
          emailKey: "dummy_email_key",
          outcome: "sent",
          via: "ceo",
          createdAt: now,
        });
      }
    });

    // Create another designer with phone to bypass target cooldown
    let designer2Id: any;
    await t.run(async (ctx) => {
      designer2Id = await ctx.db.insert("staff", {
        name: "Designer 2",
        email: "designer2@test.local",
        role: "designer",
        passwordHash: "hash",
        passwordSalt: "salt",
        phone: "+233244444444",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
    });

    await expect(
      t.action(api.staffAuthNode.ceoSendStaffPasswordSms, {
        staffToken: ceoToken,
        targetStaffId: designer2Id,
      })
    ).rejects.toThrow("Daily SMS cap reached.");
  });

  it("creates staff with optional phone and rejects duplicates", async () => {
    const t = convexTest(schema);
    const ceoToken = "ceo-test-token";
    let ceoId: any;

    await t.run(async (ctx) => {
      ceoId = await ctx.db.insert("staff", {
        name: "CEO Person",
        email: "ceo2@test.local",
        role: "ceo",
        passwordHash: "hash",
        passwordSalt: "salt",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: ceoId,
        tokenHash: hashToken(ceoToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000,
      });
    });

    // Create staff with phone
    const tempPass = await t.action(api.staffAuthNode.createStaffUser, {
      staffToken: ceoToken,
      name: "New Sales Person",
      email: "new-sales@test.local",
      role: "sales",
      phone: "024 555 6677",
    });
    expect(typeof tempPass).toBe("string");

    const createdStaff: any = await t.run(async (ctx) => {
      return await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", "new-sales@test.local")).first();
    });
    expect(createdStaff.phone).toBe("+233245556677");
    expect(createdStaff.phoneUpdatedAt).toBeDefined();

    // Duplicate phone rejected
    await expect(
      t.action(api.staffAuthNode.createStaffUser, {
        staffToken: ceoToken,
        name: "Another Sales Person",
        email: "another-sales@test.local",
        role: "sales",
        phone: "+233 24 555 6677",
      })
    ).rejects.toThrow("A staff account with this phone number already exists.");
  });
});
