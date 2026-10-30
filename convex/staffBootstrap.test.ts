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
