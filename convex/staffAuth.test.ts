import { describe, it, expect, beforeAll } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { hashPassword } from "./lib/staffCrypto";
import * as crypto from "crypto";

describe("staff authentication integration", () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
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
});
