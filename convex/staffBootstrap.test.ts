import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { internal } from "./_generated/api";
import { verifyPassword } from "./lib/staffCrypto";

describe("first CEO bootstrap", () => {
  it("creates one forced-password-change CEO with a hashed password", async () => {
    const t = convexTest(schema);
    const result = await t.action(internal.staffAuthNode.bootstrapCeo, { name: "First CEO", email: " CEO@Example.Test " });
    expect(result.email).toBe("ceo@example.test");
    expect(result.password).toHaveLength(20);
    const staff = await t.run(ctx => ctx.db.query("staff").withIndex("by_role", q => q.eq("role", "ceo")).first());
    expect(staff).toMatchObject({ email: "ceo@example.test", role: "ceo", mustChangePassword: true, isActive: true, totpEnabled: false });
    expect(staff?.passwordHash).not.toBe(result.password);
    expect(await verifyPassword(result.password, staff!.passwordHash)).toBe(true);
    expect(await t.run(ctx => ctx.db.query("adminLogs").filter(q => q.eq(q.field("action"), "Bootstrapped first CEO")).first())).toBeTruthy();
  });

  it("rejects a second bootstrap and an existing inactive CEO", async () => {
    const t = convexTest(schema);
    await t.action(internal.staffAuthNode.bootstrapCeo, { name: "First CEO", email: "first@example.test" });
    await expect(t.action(internal.staffAuthNode.bootstrapCeo, { name: "Second CEO", email: "second@example.test" })).rejects.toThrow("CEO account already exists");

    const inactive = convexTest(schema);
    await inactive.run(ctx => ctx.db.insert("staff", { name: "Inactive CEO", email: "inactive@example.test", role: "ceo", passwordHash: "existing", passwordSalt: "existing", mustChangePassword: false, isActive: false, failedAttempts: 0, totpEnabled: false, createdAt: Date.now() }));
    await expect(inactive.action(internal.staffAuthNode.bootstrapCeo, { name: "New CEO", email: "new@example.test" })).rejects.toThrow("CEO account already exists");
  });
});

describe("operator staff access recovery", () => {
  it("rotates the password, revokes sessions, and only resets 2FA when requested", async () => {
    const t = convexTest(schema);
    const oldPassword = "OldPasswordForTest2026!";
    const oldSalt = "old-salt";
    const oldHash = await import("./lib/staffCrypto").then(({ hashPassword }) => hashPassword(oldPassword, oldSalt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 }));
    const staffId = await t.run(async ctx => {
      const id = await ctx.db.insert("staff", {
        name: "Recovery Target",
        email: "target@example.test",
        role: "admin",
        passwordHash: oldHash,
        passwordSalt: oldSalt,
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 4,
        lockedUntil: Date.now() + 60_000,
        totpSecret: "encrypted-secret",
        totpEnabled: true,
        recoveryCodes: "hashed-recovery-code",
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: id,
        tokenHash: "active-session",
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 60_000,
      });
      return id;
    });

    const first = await t.action(internal.staffAuthNode.operatorResetStaffAccess, { email: " TARGET@Example.Test " });
    expect(first.email).toBe("target@example.test");
    expect(first.password).toHaveLength(20);
    const afterPasswordOnly = await t.run(ctx => ctx.db.get(staffId));
    expect(afterPasswordOnly?.mustChangePassword).toBe(true);
    expect(afterPasswordOnly?.failedAttempts).toBe(0);
    expect(afterPasswordOnly?.lockedUntil).toBeUndefined();
    expect(afterPasswordOnly?.totpEnabled).toBe(true);
    expect(await verifyPassword(first.password, afterPasswordOnly!.passwordHash)).toBe(true);
    expect(await t.run(ctx => ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", staffId)).collect())).toEqual([
      expect.objectContaining({ revokedAt: expect.any(Number) }),
    ]);

    const second = await t.action(internal.staffAuthNode.operatorResetStaffAccess, { email: "target@example.test", resetTwoFactor: true });
    expect(second.password).not.toBe(first.password);
    const afterFullReset = await t.run(ctx => ctx.db.get(staffId));
    expect(afterFullReset?.totpEnabled).toBe(false);
    expect(afterFullReset?.totpSecret).toBeUndefined();
    expect(afterFullReset?.recoveryCodes).toBeUndefined();
    expect(await verifyPassword(second.password, afterFullReset!.passwordHash)).toBe(true);
    const log = await t.run(ctx => ctx.db.query("adminLogs").filter(q => q.eq(q.field("targetId"), staffId)).collect());
    expect(log.some(row => row.adminName === "operator" && row.action.includes("Operator Reset"))).toBe(true);
  });

  it("rejects an unknown staff email", async () => {
    const t = convexTest(schema);
    await expect(t.action(internal.staffAuthNode.operatorResetStaffAccess, { email: "missing@example.test" })).rejects.toThrow("Staff account not found");
  });
});
