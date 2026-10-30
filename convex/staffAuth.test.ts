import { describe, it, expect, beforeAll, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { hashPassword, encryptTotpSecret } from "./lib/staffCrypto";
import { authenticator } from "otplib";
import * as crypto from "crypto";

describe("staff authentication integration", () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
  });

  it("creates a durable challenge and accepts the current authenticator code", async () => {
    const t = convexTest(schema);
    const secret = authenticator.generateSecret();
    const password = "ChallengePassword2026!";
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, salt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });
    await t.run(async (ctx) => ctx.db.insert("staff", {
      name: "Challenge Admin", email: "challenge@gabbytest.com", role: "admin", passwordHash, passwordSalt: salt,
      mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true,
      totpSecret: encryptTotpSecret(secret, process.env.STAFF_2FA_ENC_KEY!), createdAt: Date.now(),
    }));
    const login = await t.action(api.staffAuthNode.loginAction, { email: "challenge@gabbytest.com", password });
    expect(login.status).toBe("2fa_required");
    const verified = await t.action(api.staffAuthNode.verify2FA, { token: login.token!, code: authenticator.generate(secret) });
    expect(verified.status).toBe("success");
  });

  it("requires the CEO password and permanently deletes a non-CEO staff account", async () => {
    const t = convexTest(schema);
    const password = "CeoDeletePassword2026!";
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, salt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });
    const token = "ceo-delete-token";
    const ids = await t.run(async (ctx) => {
      const ceo = await ctx.db.insert("staff", { name: "CEO", email: "delete-ceo@test.local", role: "ceo", passwordHash, passwordSalt: salt, mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now() });
      const target = await ctx.db.insert("staff", { name: "Target", email: "target@test.local", role: "sales", passwordHash: "x", passwordSalt: "x", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now() });
      await ctx.db.insert("staffSessions", { staffId: ceo, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
      await ctx.db.insert("staffSessions", { staffId: target, tokenHash: "target-session", createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
      return { ceo, target };
    });
    await expect(t.action(api.staffAuthNode.deleteStaffUser, { staffToken: token, targetStaffId: ids.target, currentPassword: "wrong", confirmation: "DELETE target@test.local" })).rejects.toThrow("CEO password is incorrect");
    await t.action(api.staffAuthNode.deleteStaffUser, { staffToken: token, targetStaffId: ids.target, currentPassword: password, confirmation: "DELETE target@test.local" });
    const result = await t.run(async (ctx) => ({ staff: await ctx.db.get(ids.target), sessions: await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", ids.target)).collect(), logs: await ctx.db.query("adminLogs").collect() }));
    expect(result.staff).toBeNull();
    expect(result.sessions).toHaveLength(0);
    expect(result.logs.some((log: any) => log.action === "Permanently Deleted Staff")).toBe(true);
  });

  it("login -> authenticated query -> logout -> unauthenticated", async () => {
    const t = convexTest(schema);

    // 1. Seed staff user with hashed password
    const salt = crypto.randomBytes(16).toString("hex");
    const password = "SuperSecretPassword2026!";
    const passwordHash = await hashPassword(password, salt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });

    const staffId = await t.run(async (ctx) => {
      return await ctx.db.insert("staff", {
        name: "Test Admin",
        email: "admin@gabbytest.com",
        role: "admin",
        passwordHash,
        passwordSalt: salt,
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
    });

    // 2. Perform login via action
    const loginResult = await t.action(api.staffAuthNode.loginAction, {
      email: "admin@gabbytest.com",
      password,
    });

    expect(loginResult.status).toBe("success");
    expect(loginResult.token).toBeDefined();
    const token = loginResult.token;

    // 3. Query protected profile
    const profile = await t.query(api.staffAuth.getStaffProfile, { staffToken: token });
    expect(profile).not.toBeNull();
    expect(profile?.email).toBe("admin@gabbytest.com");
    expect(profile?.role).toBe("admin");

    // 4. Logout
    await t.mutation(api.staffAuth.logout, { staffToken: token });

    // 5. Query protected profile after logout should be null
    const profileAfterLogout = await t.query(api.staffAuth.getStaffProfile, { staffToken: token });
    expect(profileAfterLogout).toBeNull();
  });

  it("successful login resets account failures and rate limits normalized email", async () => {
    const t = convexTest(schema);
    const salt = crypto.randomBytes(16).toString("hex");
    const password = "CorrectPassword2026!";
    const passwordHash = await hashPassword(password, salt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });
    const staffId = await t.run(async (ctx) => ctx.db.insert("staff", {
      name: "Reset Counter",
      email: "reset@gabbytest.com",
      role: "admin",
      passwordHash,
      passwordSalt: salt,
      mustChangePassword: false,
      isActive: true,
      failedAttempts: 4,
      totpEnabled: false,
      createdAt: Date.now(),
    }));

    const result = await t.action(api.staffAuthNode.loginAction, {
      email: " RESET@GabbyTest.com ",
      password,
    });
    expect(result.status).toBe("success");

    const state = await t.run(async (ctx) => ({
      staff: await ctx.db.get(staffId),
      limits: await ctx.db.query("rateLimits").collect(),
    }));
    expect(state.staff?.failedAttempts).toBe(0);
    expect(state.staff?.lockedUntil).toBeUndefined();
    expect(state.limits).toContainEqual(expect.objectContaining({
      identifier: "email_reset@gabbytest.com",
      endpoint: "staffLogin",
      count: 1,
    }));
  });

  it("2FA setup and verification fail closed without the encryption key", async () => {
    const t = convexTest(schema);
    const salt = crypto.randomBytes(16).toString("hex");
    const password = "CorrectPassword2026!";
    const passwordHash = await hashPassword(password, salt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });
    const staffId = await t.run(async (ctx) => ctx.db.insert("staff", {
      name: "Missing Key",
      email: "missing-key@gabbytest.com",
      role: "admin",
      passwordHash,
      passwordSalt: salt,
      mustChangePassword: false,
      isActive: true,
      failedAttempts: 0,
      totpEnabled: false,
      createdAt: Date.now(),
    }));
    const login = await t.action(api.staffAuthNode.loginAction, { email: "missing-key@gabbytest.com", password });
    const configuredKey = process.env.STAFF_2FA_ENC_KEY;

    try {
      delete process.env.STAFF_2FA_ENC_KEY;
      await expect(t.action(api.staffAuthNode.setup2FA, { staffToken: login.token! })).rejects.toThrow("STAFF_2FA_ENC_KEY is required");
      await expect(t.action(api.staffAuthNode.verify2FA, { token: login.token!, code: "000000", isSetup: true })).rejects.toThrow("STAFF_2FA_ENC_KEY is required");
      const staff = await t.run(async (ctx) => ctx.db.get(staffId));
      expect(staff?.totpSecret).toBeUndefined();
    } finally {
      if (configuredKey) process.env.STAFF_2FA_ENC_KEY = configuredKey;
    }
  });

  it("failed logins increment counter and lock account", async () => {
    const t = convexTest(schema);
    const salt = crypto.randomBytes(16).toString("hex");
    const password = "CorrectPassword2026!";
    const passwordHash = await hashPassword(password, salt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 });

    const staffId = await t.run(async (ctx) => {
      return await ctx.db.insert("staff", {
        name: "Test Lock",
        email: "lock@gabbytest.com",
        role: "admin",
        passwordHash,
        passwordSalt: salt,
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
    });

    // 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await expect(
        t.action(api.staffAuthNode.loginAction, {
          email: "lock@gabbytest.com",
          password: "WrongPassword!",
        })
      ).rejects.toThrow();
    }

    // Check that account is locked in db
    const staff = await t.run(async (ctx) => ctx.db.get(staffId));
    expect(staff?.lockedUntil).toBeDefined();
    expect(staff?.lockedUntil).toBeGreaterThan(Date.now());
  });

  it("cleanup removes expired and revoked sessions while preserving active sessions", async () => {
    vi.useFakeTimers();
    const t = convexTest(schema);
    const now = Date.now();
    await t.run(async ctx => {
      const staffId = await ctx.db.insert("staff", { name: "Cleanup", email: "cleanup@test", role: "admin", passwordHash: "h", passwordSalt: "s", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: now });
      for (let i = 0; i < 600; i++) await ctx.db.insert("staffSessions", { staffId, tokenHash: `revoked-${i}`, createdAt: now, lastActivityAt: now, expiresAt: now - 1000, revokedAt: now - 500 });
      for (let i = 0; i < 10; i++) await ctx.db.insert("staffSessions", { staffId, tokenHash: `expired-${i}`, createdAt: now, lastActivityAt: now, expiresAt: now - 1000 });
      for (let i = 0; i < 5; i++) await ctx.db.insert("staffSessions", { staffId, tokenHash: `active-${i}`, createdAt: now, lastActivityAt: now, expiresAt: now + 3600000 });
    });
    await t.mutation(internal.staffAuth.cleanupSessions, {});
    await t.finishAllScheduledFunctions(() => vi.runAllTimers());
    const sessions = await t.run(ctx => ctx.db.query("staffSessions").collect());
    expect(sessions).toHaveLength(5);
    expect(sessions.every(session => session.tokenHash.startsWith("active-"))).toBe(true);
    vi.useRealTimers();
  });
});
