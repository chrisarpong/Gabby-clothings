import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api } from "./_generated/api";
import type { StaffRole } from "./staffPermissions";

type SeedOptions = { mustChangePassword?: boolean; totpEnabled?: boolean };

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function seedStaff(t: ReturnType<typeof convexTest>, role: StaffRole, suffix: string, options: SeedOptions = {}) {
  const staffToken = `staff-action-${suffix}`;
  const staffId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("staff", {
      name: `${role} ${suffix}`,
      email: `${role}-${suffix}@example.test`,
      role,
      passwordHash: "test-password-hash",
      passwordSalt: "test-password-salt",
      mustChangePassword: options.mustChangePassword ?? false,
      isActive: true,
      failedAttempts: 0,
      totpEnabled: options.totpEnabled ?? true,
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
  return { staffToken, staffId };
}

async function checkActionAuthorization(
  t: ReturnType<typeof convexTest>,
  invoke: (token: string) => Promise<unknown>,
  wrongRole: StaffRole,
  suffix: string,
) {
  const setupRequired = await seedStaff(t, "ceo", `${suffix}-password`, { mustChangePassword: true });
  await expect(invoke(setupRequired.staffToken)).rejects.toThrow("SETUP_REQUIRED");

  const twoFactorRequired = await seedStaff(t, "ceo", `${suffix}-2fa`, { totpEnabled: false });
  await expect(invoke(twoFactorRequired.staffToken)).rejects.toThrow("SETUP_REQUIRED");

  const unauthorizedRole = await seedStaff(t, wrongRole, `${suffix}-role`);
  await expect(invoke(unauthorizedRole.staffToken)).rejects.toThrow("FORBIDDEN");
  await expect(invoke(`garbage-${suffix}`)).rejects.toThrow("UNAUTHENTICATED");

  const complete = await seedStaff(t, "ceo", `${suffix}-complete`);
  await invoke(complete.staffToken);
}

describe("complete staff session required before privileged actions", () => {
  it("guards createStaffUser", async () => {
    const t = convexTest(schema);
    await checkActionAuthorization(t, async staffToken => {
      return await t.action(api.staffAuthNode.createStaffUser, {
        staffToken,
        name: "New Staff",
        email: `new-${staffToken}@example.test`,
        role: "sales",
      });
    }, "admin", "create");
  });

  it("guards resetStaffPassword", async () => {
    const t = convexTest(schema);
    const targetStaffId = await t.run(ctx => ctx.db.insert("staff", {
      name: "Reset Target", email: "reset-target@example.test", role: "sales", passwordHash: "old", passwordSalt: "old",
      mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now(),
    }));
    await checkActionAuthorization(t, async staffToken => {
      return await t.action(api.staffAuthNode.resetStaffPassword, { staffToken, targetStaffId });
    }, "admin", "reset");
  });

  it("guards replyToMessage", async () => {
    process.env.RESEND_API_KEY = "re_test_staff_action";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ id: "test-email" }), { status: 200 })));
    const t = convexTest(schema);
    const messageId = await t.run(ctx => ctx.db.insert("messages", {
      name: "Customer", email: "customer@example.test", subject: "Question", message: "Question body", status: "unread",
    }));
    await checkActionAuthorization(t, async staffToken => {
      return await t.action(api.email.replyToMessage, { staffToken, messageId, message: "Test reply" });
    }, "designer", "reply");
    vi.unstubAllGlobals();
  });

  it("guards sendPromoBroadcast", async () => {
    process.env.RESEND_API_KEY = "re_test_staff_action";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ id: "test-email" }), { status: 200 })));
    const t = convexTest(schema);
    await checkActionAuthorization(t, async staffToken => {
      return await t.action(api.email.sendPromoBroadcast, { staffToken, promoCode: "TEST", discountValue: 10 });
    }, "admin", "promo");
    vi.unstubAllGlobals();
  });
});
