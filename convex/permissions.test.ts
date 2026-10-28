import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api } from "./_generated/api";
import { STAFF_ROLES, hasPermission } from "./staffPermissions";
import type { StaffRole } from "./staffPermissions";

const expectedMatrix = {
  ceo: [
    "dashboard", "orders", "sales_portal", "inventory", "appointments", "reviews",
    "promotions", "content", "clients", "messages", "settings", "audit_logs",
    "designer_portal", "marketing", "financials", "team_management",
  ],
  admin: [
    "dashboard", "orders", "sales_portal", "inventory", "appointments", "reviews",
    "promotions", "content", "clients", "messages", "settings", "audit_logs",
  ],
  designer: ["designer_portal"],
  sales: ["sales_portal", "clients"],
} as const;

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function seedStaff(t: ReturnType<typeof convexTest>, role: StaffRole) {
  const token = `${role}-permission-test-token`;
  await t.run(async (ctx) => {
    const staffId = await ctx.db.insert("staff", {
      name: `${role} permission test`,
      email: `${role}-permission-test@example.test`,
      role,
      passwordHash: "unused-test-hash",
      passwordSalt: "unused-test-salt",
      mustChangePassword: false,
      isActive: true,
      failedAttempts: 0,
      totpEnabled: false,
      createdAt: Date.now(),
    });
    await ctx.db.insert("staffSessions", {
      staffId,
      tokenHash: tokenHash(token),
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
  });
  return token;
}

describe("Phase 2 permission matrix", () => {
  it("matches the exact approved role matrix", () => {
    expect(STAFF_ROLES).toEqual(expectedMatrix);
    expect(hasPermission("sales", "dashboard")).toBe(false);
    expect(hasPermission("admin", "financials")).toBe(false);
  });

  it("sales cannot write settings", async () => {
    const t = convexTest(schema);
    const staffToken = await seedStaff(t, "sales");
    await expect(t.mutation(api.settings.setSetting, {
      staffToken,
      key: "maintenanceMode",
      value: true,
    })).rejects.toThrow();
  });

  it("admin cannot change a financial setting", async () => {
    const t = convexTest(schema);
    const staffToken = await seedStaff(t, "admin");
    await expect(t.mutation(api.settings.setSetting, {
      staffToken,
      key: "standardShippingRate",
      value: 55,
    })).rejects.toThrow("Unauthorized: Requires financials");
  });

  it("designer cannot read dashboard analytics", async () => {
    const t = convexTest(schema);
    const staffToken = await seedStaff(t, "designer");
    await expect(t.query(api.analytics.getDashboardStats, { staffToken }))
      .rejects.toThrow("Unauthorized: Requires dashboard");
  });

  it("CEO can read dashboard analytics", async () => {
    const t = convexTest(schema);
    const staffToken = await seedStaff(t, "ceo");
    const stats = await t.query(api.analytics.getDashboardStats, { staffToken });
    expect(stats).toBeTruthy();
  });

  it("dashboard analytics throws for an invalid staff session", async () => {
    const t = convexTest(schema);
    await expect(t.query(api.analytics.getDashboardStats, { staffToken: "invalid-dashboard-token" }))
      .rejects.toThrow();
  });
});
