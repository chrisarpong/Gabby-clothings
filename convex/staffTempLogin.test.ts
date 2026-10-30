import { describe, it, expect, beforeAll } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { hashPassword } from "./lib/staffCrypto";
import * as crypto from "crypto";

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

describe("Temporary password login and change password flow (Task 7)", () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
    process.env.SMS_PROVIDER = "mock";
  });

  it("completes temp login flow, enforces 2FA, voids on 5 failures, revokes other sessions on change", async () => {
    const t = convexTest(schema);

    const oldPassword = "OldSecurePassword2026!";
    const oldSalt = crypto.randomBytes(16).toString("hex");
    const oldHash = await hashPassword(oldPassword, oldSalt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });

    const tempPassword = "TempPass99#";
    const tempSalt = crypto.randomBytes(16).toString("hex");
    const tempHash = await hashPassword(tempPassword, tempSalt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });

    let staffId: any;
    const email = "temp-designer@test.local";

    await t.run(async (ctx) => {
      staffId = await ctx.db.insert("staff", {
        name: "Temp Designer",
        email,
        role: "designer",
        passwordHash: oldHash,
        passwordSalt: oldSalt,
        phone: "+233241234567",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: true,
        createdAt: Date.now(),
      });

      // Insert reset row
      await ctx.db.insert("staffPasswordResets", {
        staffId,
        tempPasswordHash: tempHash,
        tempPasswordSalt: tempSalt,
        expiresAt: Date.now() + 15 * 60 * 1000,
        attempts: 0,
        createdAt: Date.now(),
        via: "self_service",
      });
    });

    // 1. Temp password login -> triggers 2FA challenge first (never bypasses 2FA!)
    const loginRes = await t.action(api.staffAuthNode.loginAction, {
      email,
      password: tempPassword,
    });
    expect(loginRes.status).toBe("2fa_required");
    expect(loginRes.token).toBeDefined();

    // Staff now has mustChangePassword = true in database
    const staffAfterTempLogin: any = await t.run(async (ctx) => ctx.db.get(staffId));
    expect(staffAfterTempLogin.mustChangePassword).toBe(true);

    // Temp reset row marked usedAt
    const resetRow: any = await t.run(async (ctx) => {
      return await ctx.db.query("staffPasswordResets").withIndex("by_staffId", q => q.eq("staffId", staffId)).first();
    });
    expect(resetRow.usedAt).toBeTypeOf("number");

    // 2. Used temp cannot be reused
    await expect(
      t.action(api.staffAuthNode.loginAction, {
        email,
        password: tempPassword,
      })
    ).rejects.toThrow("Invalid email or password");

    // 3. Create a session for this staff to simulate post-2FA state
    const sessionToken = "active-session-token-123";
    const otherSessionToken = "other-device-token-456";
    await t.run(async (ctx) => {
      await ctx.db.insert("staffSessions", {
        staffId,
        tokenHash: tokenHash(sessionToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
      await ctx.db.insert("staffSessions", {
        staffId,
        tokenHash: tokenHash(otherSessionToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
    });

    // 4. Change password cannot equal current password
    await expect(
      t.action(api.staffAuthNode.changePasswordAction, {
        staffToken: sessionToken,
        newPassword: oldPassword,
      })
    ).rejects.toThrow("New password cannot be the same as the current password");

    // 5. Change password cannot equal the temporary password
    await expect(
      t.action(api.staffAuthNode.changePasswordAction, {
        staffToken: sessionToken,
        newPassword: tempPassword,
      })
    ).rejects.toThrow("New password cannot be the same as your temporary password.");

    // 6. Set valid new password
    const newPassword = "BrandNewSecurePassword2026!";
    const changeRes = await t.action(api.staffAuthNode.changePasswordAction, {
      staffToken: sessionToken,
      newPassword,
    });
    expect(changeRes.status).toBe("success");

    // 7. Old password no longer works
    await expect(
      t.action(api.staffAuthNode.loginAction, {
        email,
        password: oldPassword,
      })
    ).rejects.toThrow("Invalid email or password");

    // 8. Other sessions revoked, current session preserved
    const otherSession: any = await t.run(async (ctx) => {
      return await ctx.db.query("staffSessions").withIndex("by_tokenHash", q => q.eq("tokenHash", tokenHash(otherSessionToken))).first();
    });
    expect(otherSession.revokedAt).toBeTypeOf("number");

    const currentSession: any = await t.run(async (ctx) => {
      return await ctx.db.query("staffSessions").withIndex("by_tokenHash", q => q.eq("tokenHash", tokenHash(sessionToken))).first();
    });
    expect(currentSession.revokedAt).toBeUndefined();

    // 9. Admin audit log recorded for password change
    const auditLog: any = await t.run(async (ctx) => {
      return await ctx.db.query("adminLogs").order("desc").first();
    });
    expect(auditLog.action).toBe("Staff completed password change after SMS reset");
    expect(auditLog.userId).toBe(staffId);
  });

  it("voids temp password after 5 wrong attempts and fails on expired temp", async () => {
    const t = convexTest(schema);

    const tempPassword = "CorrectTempPass1";
    const tempSalt = crypto.randomBytes(16).toString("hex");
    const tempHash = await hashPassword(tempPassword, tempSalt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });

    let staffId: any;
    const email = "attempts-designer@test.local";

    await t.run(async (ctx) => {
      staffId = await ctx.db.insert("staff", {
        name: "Attempts Designer",
        email,
        role: "designer",
        passwordHash: "h",
        passwordSalt: "s",
        phone: "+233241234567",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });

      await ctx.db.insert("staffPasswordResets", {
        staffId,
        tempPasswordHash: tempHash,
        tempPasswordSalt: tempSalt,
        expiresAt: Date.now() + 15 * 60 * 1000,
        attempts: 0,
        createdAt: Date.now(),
        via: "self_service",
      });
    });

    // 5 wrong attempts
    for (let i = 0; i < 5; i++) {
      await expect(
        t.action(api.staffAuthNode.loginAction, {
          email,
          password: `WrongTempGuess${i}`,
        })
      ).rejects.toThrow();
    }

    // After 5 attempts, reset is voided
    const voidedReset: any = await t.run(async (ctx) => {
      return await ctx.db.query("staffPasswordResets").withIndex("by_staffId", q => q.eq("staffId", staffId)).first();
    });
    expect(voidedReset.voidedAt).toBeTypeOf("number");

    // Correct temp password now rejected
    await expect(
      t.action(api.staffAuthNode.loginAction, {
        email,
        password: tempPassword,
      })
    ).rejects.toThrow();
  });

  it("fails on expired temp password", async () => {
    const t = convexTest(schema);

    const tempPassword = "ExpiredTempPass1";
    const tempSalt = crypto.randomBytes(16).toString("hex");
    const tempHash = await hashPassword(tempPassword, tempSalt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });

    const email = "expired-user@test.local";
    await t.run(async (ctx) => {
      const staffId = await ctx.db.insert("staff", {
        name: "Expired User",
        email,
        role: "designer",
        passwordHash: "h",
        passwordSalt: "s",
        phone: "+233241234567",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });

      // Insert EXPIRED reset row (expired 1 minute ago)
      await ctx.db.insert("staffPasswordResets", {
        staffId,
        tempPasswordHash: tempHash,
        tempPasswordSalt: tempSalt,
        expiresAt: Date.now() - 60 * 1000,
        attempts: 0,
        createdAt: Date.now() - 16 * 60 * 1000,
        via: "self_service",
      });
    });

    await expect(
      t.action(api.staffAuthNode.loginAction, {
        email,
        password: tempPassword,
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("refuses temp password for inactive/deactivated account", async () => {
    const t = convexTest(schema);

    const tempPassword = "TempPassInactive";
    const tempSalt = crypto.randomBytes(16).toString("hex");
    const tempHash = await hashPassword(tempPassword, tempSalt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });

    const email = "inactive@test.local";
    await t.run(async (ctx) => {
      const staffId = await ctx.db.insert("staff", {
        name: "Inactive User",
        email,
        role: "designer",
        passwordHash: "h",
        passwordSalt: "s",
        phone: "+233241234567",
        mustChangePassword: false,
        isActive: false, // inactive!
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });

      await ctx.db.insert("staffPasswordResets", {
        staffId,
        tempPasswordHash: tempHash,
        tempPasswordSalt: tempSalt,
        expiresAt: Date.now() + 15 * 60 * 1000,
        attempts: 0,
        createdAt: Date.now(),
        via: "self_service",
      });
    });

    await expect(
      t.action(api.staffAuthNode.loginAction, {
        email,
        password: tempPassword,
      })
    ).rejects.toThrow("Account is deactivated");
  });
});
