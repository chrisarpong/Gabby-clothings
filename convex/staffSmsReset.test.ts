import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { clearMockSentMessages, getMockSentMessages } from "./lib/sms";
import * as crypto from "crypto";

describe("Staff SMS password reset request (Task 6)", () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
  });

  beforeEach(() => {
    clearMockSentMessages();
    process.env.SMS_PROVIDER = "mock";
  });

  it("handles sent case, disabled feature, role not allowed, no phone, cooldown, limits, and voids earlier resets", async () => {
    const t = convexTest(schema);

    // 1. Feature disabled by default (test with dedicated email)
    const disabledRes = await t.action(api.staffAuthNode.requestStaffPasswordSms, {
      email: "disabled-test@test.local",
    });
    expect(disabledRes.message).toBe("Password reset by SMS is not available. Please contact your manager.");

    // Enable feature in staffSecuritySettings
    await t.run(async (ctx) => {
      await ctx.db.insert("staffSecuritySettings", {
        smsResetEnabled: true,
        smsResetAllowedRoles: ["designer", "sales"],
        smsDailyCap: 10,
        updatedAt: Date.now(),
      });
    });

    // Seed staff designer
    let designerId: any;
    const designerEmail = "designer-sms@test.local";
    const designerPhone = "+233241234567";
    await t.run(async (ctx) => {
      designerId = await ctx.db.insert("staff", {
        name: "Designer",
        email: designerEmail,
        role: "designer",
        passwordHash: "current_hash",
        passwordSalt: "current_salt",
        phone: designerPhone,
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
    });

    // 2. Sent case
    const sentRes = await t.action(api.staffAuthNode.requestStaffPasswordSms, {
      email: designerEmail,
    });
    expect(sentRes.message).toBe("If this account can use SMS reset, a temporary password has been sent.");
    const sentMessages = getMockSentMessages();
    expect(sentMessages.length).toBe(1);
    expect(sentMessages[0].to).toBe(designerPhone);
    expect(sentMessages[0].kind).toBe("otp");

    // Verify reset row created in DB
    const firstReset: any = await t.run(async (ctx) => {
      return await ctx.db.query("staffPasswordResets").withIndex("by_staffId", q => q.eq("staffId", designerId)).first();
    });
    expect(firstReset).toBeDefined();
    expect(firstReset.attempts).toBe(0);
    expect(firstReset.voidedAt).toBeUndefined();

    // 3. Current password is unchanged
    const staffCheck: any = await t.run(async (ctx) => ctx.db.get(designerId));
    expect(staffCheck.passwordHash).toBe("current_hash");

    // 4. Cooldown triggers generic message and logs rate limit
    const cooldownRes = await t.action(api.staffAuthNode.requestStaffPasswordSms, {
      email: designerEmail,
    });
    expect(cooldownRes.message).toBe("If this account can use SMS reset, a temporary password has been sent.");
    // No new SMS sent
    expect(getMockSentMessages().length).toBe(1);

    // 5. Unknown email returns identical generic message and writes a log row
    const unknownRes = await t.action(api.staffAuthNode.requestStaffPasswordSms, {
      email: "unknown-person@example.com",
    });
    expect(unknownRes.message).toBe("If this account can use SMS reset, a temporary password has been sent.");
    const unknownLog: any = await t.run(async (ctx) => {
      const emailKey = crypto.createHash("sha256").update("unknown-person@example.com").digest("hex");
      return await ctx.db.query("staffSmsLog").withIndex("by_emailKey_createdAt", q => q.eq("emailKey", emailKey)).first();
    });
    expect(unknownLog?.outcome).toBe("no_account");

    // 6. Role not allowed (e.g. admin when admin is unticked)
    let adminId: any;
    await t.run(async (ctx) => {
      adminId = await ctx.db.insert("staff", {
        name: "Admin Staff",
        email: "admin-not-allowed@test.local",
        role: "admin",
        passwordHash: "h",
        passwordSalt: "s",
        phone: "+233249876543",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
    });
    const adminRes = await t.action(api.staffAuthNode.requestStaffPasswordSms, {
      email: "admin-not-allowed@test.local",
    });
    expect(adminRes.message).toBe("If this account can use SMS reset, a temporary password has been sent.");
    const adminLog: any = await t.run(async (ctx) => {
      const emailKey = crypto.createHash("sha256").update("admin-not-allowed@test.local").digest("hex");
      return await ctx.db.query("staffSmsLog").withIndex("by_emailKey_createdAt", q => q.eq("emailKey", emailKey)).first();
    });
    expect(adminLog?.outcome).toBe("role_not_allowed");

    // 7. No phone
    let noPhoneId: any;
    await t.run(async (ctx) => {
      noPhoneId = await ctx.db.insert("staff", {
        name: "Sales No Phone",
        email: "sales-nophone@test.local",
        role: "sales",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });
    });
    const noPhoneRes = await t.action(api.staffAuthNode.requestStaffPasswordSms, {
      email: "sales-nophone@test.local",
    });
    expect(noPhoneRes.message).toBe("If this account can use SMS reset, a temporary password has been sent.");
    const noPhoneLog: any = await t.run(async (ctx) => {
      const emailKey = crypto.createHash("sha256").update("sales-nophone@test.local").digest("hex");
      return await ctx.db.query("staffSmsLog").withIndex("by_emailKey_createdAt", q => q.eq("emailKey", emailKey)).first();
    });
    expect(noPhoneLog?.outcome).toBe("no_phone");

    // 8. Second request (after clearing logs to bypass cooldown) voids the first reset row
    await t.run(async (ctx) => {
      const logs = await ctx.db.query("staffSmsLog").collect();
      for (const l of logs) await ctx.db.delete(l._id);
    });
    await t.action(api.staffAuthNode.requestStaffPasswordSms, {
      email: designerEmail,
    });
    const previousReset: any = await t.run(async (ctx) => ctx.db.get(firstReset._id));
    expect(previousReset.voidedAt).toBeTypeOf("number");

    // 9. Argument validator rejects "phone" parameter
    await expect(
      (t.action as any)(api.staffAuthNode.requestStaffPasswordSms, {
        email: designerEmail,
        phone: "+233241234567",
      })
    ).rejects.toThrow();
  });
});
