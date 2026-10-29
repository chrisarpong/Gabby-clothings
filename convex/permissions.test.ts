import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api, internal } from "./_generated/api";
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

async function seedStaff(t: ReturnType<typeof convexTest>, role: StaffRole, suffix = "permission-test") {
  const token = `${role}-${suffix}-token`;
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

  it("staff notification feed only includes categories allowed by the role", async () => {
    const t = convexTest(schema);
    const designerToken = await seedStaff(t, "designer");
    const ceoToken = await seedStaff(t, "ceo");
    await t.run(async (ctx) => {
      await ctx.db.insert("messages", { name: "Client", email: "client@example.test", subject: "Fitting", message: "Please call", status: "unread" });
      await ctx.db.insert("appointments", { name: "Client", email: "client@example.test", phone: "000", date: "2026-11-01", status: "pending" });
      await ctx.db.insert("orders", { orderId: "GB-TEST", items: [], totalAmount: 100, status: "processing" });
    });

    const designerFeed = await t.query(api.staffNotifications.getFeed, { staffToken: designerToken });
    expect(designerFeed.counts).toEqual({ messages: 0, appointments: 0, orders: 0, total: 0 });

    const ceoFeed = await t.query(api.staffNotifications.getFeed, { staffToken: ceoToken });
    expect(ceoFeed.counts).toEqual({ messages: 1, appointments: 1, orders: 1, total: 3 });
    expect(ceoFeed.items).toHaveLength(3);
  });

  it("message replies reject invalid staff sessions before sending", async () => {
    const t = convexTest(schema);
    const messageId = await t.run(async (ctx) => await ctx.db.insert("messages", {
      name: "Client",
      email: "client@example.test",
      subject: "Question",
      message: "Hello",
      status: "unread",
    }));
    await expect(t.action(api.email.replyToMessage, {
      staffToken: "invalid-message-reply-token",
      messageId,
      message: "Thanks for reaching out",
    })).rejects.toThrow("Unauthorized: Requires an active staff session with messages permission.");
  });

  it("designer work is assigned, bounded, and scoped to the session identity", async () => {
    const t = convexTest(schema);
    const designerToken = await seedStaff(t, "designer");
    const otherDesignerToken = "other-designer-token";
    const ceoToken = await seedStaff(t, "ceo");
    let assignedDesignerId: any;
    let orderId: any;
    let appointmentId: any;
    await t.run(async (ctx) => {
      assignedDesignerId = await ctx.db.insert("staff", {
        name: "Assigned Designer", email: "assigned-designer@example.test", role: "designer", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: assignedDesignerId, tokenHash: tokenHash(otherDesignerToken), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000,
      });
      const userId = await ctx.db.insert("users", {
        clerkId: "client-clerk-id", email: "private@example.test", firstName: "Private", lastName: "Client", role: "client", savedMeasurements: { chest: 40 },
      });
      void userId;
      orderId = await ctx.db.insert("orders", {
        orderId: "GB-DESIGN", userId: "client-clerk-id", customerDetails: { email: "private@example.test", firstName: "Private", lastName: "Client" },
        items: [{ quantity: 1, productName: "Suit", measurements: { chest: 40 } }], totalAmount: 999, paymentStatus: "paid", status: "processing", assignedDesignerId: assignedDesignerId,
      });
      for (let i = 0; i < 12; i++) {
        await ctx.db.insert("orderActivityLog", {
          orderId,
          stage: "note",
          performedBy: assignedDesignerId,
          note: `Activity note ${i}`,
          timestamp: Date.now() + i,
        });
      }
      appointmentId = await ctx.db.insert("appointments", {
        userId: "client-clerk-id", name: "Private Client", email: "private@example.test", phone: "000", date: "2026-11-02", status: "pending", assignedStaffId: assignedDesignerId,
      });
    });

    const ownOrders = await t.query(api.designer.getMyOrders, { staffToken: otherDesignerToken });
    expect(ownOrders).toHaveLength(1);
    expect(ownOrders[0]).not.toHaveProperty("customerDetails");
    expect(ownOrders[0]).not.toHaveProperty("paymentStatus");
    expect(ownOrders[0]).not.toHaveProperty("shippingAddress");
    expect(ownOrders[0].notes).toHaveLength(10);
    expect(ownOrders[0].notes[0].note).toBe("Activity note 11");
    expect(await t.query(api.designer.getMyOrders, { staffToken: designerToken })).toHaveLength(0);
    await expect(t.query(api.designer.getClientMeasurements, { staffToken: designerToken, orderId }))
      .rejects.toThrow("This order is not assigned to this designer.");
    await expect(t.mutation(api.designer.updateMyOrderProduction, {
      staffToken: designerToken, orderId, productionStatus: "completed",
    })).rejects.toThrow("This order is not assigned to this designer.");

    const measurements = await t.query(api.designer.getClientMeasurements, { staffToken: otherDesignerToken, appointmentId });
    expect(measurements).toEqual({ chest: 40 });
    await t.mutation(api.designer.updateMyOrderProduction, {
      staffToken: otherDesignerToken, orderId, productionStatus: "completed", note: "Final stitching complete",
    });
    const history = await t.query(api.designer.getMyHistory, { staffToken: ceoToken, designerId: assignedDesignerId });
    expect(history).toHaveLength(1);
    const activity = await t.query(api.orderActivity.getByOrder, { staffToken: otherDesignerToken, orderId });
    expect(activity.at(-1)?.performedBy).toBe(assignedDesignerId);
  });

  it("assignment tools expose only active designers and validate both assignment targets", async () => {
    const t = convexTest(schema);
    const adminToken = await seedStaff(t, "admin");
    const designerToken = await seedStaff(t, "designer");
    let activeDesignerId: any;
    let inactiveDesignerId: any;
    let adminId: any;
    let orderId: any;
    let appointmentId: any;
    await t.run(async (ctx) => {
      activeDesignerId = await ctx.db.insert("staff", {
        name: "Active Designer", email: "active-designer@example.test", role: "designer", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      });
      inactiveDesignerId = await ctx.db.insert("staff", {
        name: "Inactive Designer", email: "inactive-designer@example.test", role: "designer", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: false, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      });
      adminId = await ctx.db.insert("staff", {
        name: "Other Admin", email: "other-admin@example.test", role: "admin", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      });
      orderId = await ctx.db.insert("orders", { orderId: "GB-ASSIGN", items: [], totalAmount: 100, status: "processing" });
      appointmentId = await ctx.db.insert("appointments", { name: "Client", email: "client@example.test", phone: "000", date: "2026-11-03", status: "pending" });
    });

    const assignable = await t.query(api.staffAuth.listAssignableDesigners, { staffToken: adminToken });
    expect(assignable.map(person => person._id)).toContain(activeDesignerId);
    expect(assignable.map(person => person._id)).not.toContain(inactiveDesignerId);
    expect(assignable.find(person => person._id === activeDesignerId)).toEqual({ _id: activeDesignerId, name: "Active Designer" });
    expect(assignable.every(person => Object.keys(person).sort().join(",") === "_id,name")).toBe(true);
    await expect(t.query(api.staffAuth.listAssignableDesigners, { staffToken: designerToken })).rejects.toThrow();
    await t.mutation(api.orders.assignDesigner, { staffToken: adminToken, orderId, designerId: activeDesignerId });
    await expect(t.mutation(api.orders.assignDesigner, { staffToken: adminToken, orderId, designerId: adminId }))
      .rejects.toThrow("Assigned staff member must be an active designer.");
    await expect(t.mutation(api.appointments.assignTailor, { staffToken: adminToken, appointmentId, assignedStaffId: inactiveDesignerId }))
      .rejects.toThrow("Assigned staff member must be an active designer.");
    await t.mutation(api.appointments.assignTailor, { staffToken: adminToken, appointmentId, assignedStaffId: activeDesignerId });
    const appointment: any = await t.run(async ctx => await ctx.db.get(appointmentId));
    expect(appointment?.assignedStaffId).toBe(activeDesignerId);
    expect(appointment?.assignedTo).toBe("Active Designer");
  });

  it("POS sales are attributed to the session and sales users only see their own work", async () => {
    const t = convexTest(schema);
    const salesOneToken = await seedStaff(t, "sales", "one");
    const adminToken = await seedStaff(t, "admin");
    const ceoToken = await seedStaff(t, "ceo");
    const posProductId = await t.run(async (ctx) => await ctx.db.insert("products", { name: "POS Product", slug: "pos-product", category: "shirts", description: "test", type: "ready_to_wear", status: "active", basePrice: 100, sku: "POS-001", stock: 20, images: [] }));
    let salesTwoId: any;
    await t.run(async (ctx) => {
      salesTwoId = await ctx.db.insert("staff", {
        name: "Second Sales", email: "second-sales@example.test", role: "sales", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      });
      await ctx.db.insert("orders", { orderId: "GB-OTHER", items: [], totalAmount: 50, status: "processing", createdByStaffId: salesTwoId });
      await ctx.db.insert("orders", { orderId: "WEB-001", items: [], totalAmount: 60, status: "processing" });
    });
    const createdOrderId = await t.mutation(api.orders.createPOSOrder, {
      staffToken: salesOneToken,
      customerDetails: { email: "buyer@example.test", firstName: "Buyer", lastName: "One" },
      items: [{ productId: posProductId, quantity: 1 }],
      payInFull: true,
      paymentMethod: "cash",
      idempotencyKey: "permissions-pos",
    });
    const createdOrder: any = await t.run(async ctx => await ctx.db.get(createdOrderId));
    expect(createdOrder.createdByStaffId).toBeTruthy();
    const ownSales = await t.query(api.orders.getMySales, { staffToken: salesOneToken });
    expect(ownSales).toHaveLength(1);
    expect(ownSales[0]._id).toBe(createdOrderId);
    await expect(t.query(api.orders.getAll, { staffToken: salesOneToken })).rejects.toThrow();
    expect((await t.query(api.orders.getMySales, { staffToken: adminToken })).length).toBe(3);
    expect((await t.query(api.orders.getMySales, { staffToken: ceoToken })).length).toBe(3);
  });

  it("team management normalizes duplicate emails and enforces valid roles", async () => {
    const t = convexTest(schema);
    await seedStaff(t, "ceo");
    const ceoId = await t.run(async ctx => {
      const ceo = await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", "ceo-permission-test@example.test")).first();
      return ceo!._id;
    });
    const createArgs = {
      name: "New Designer", email: "  New.Designer@Example.Test ", role: "designer", passwordHash: "hash", passwordSalt: "salt",
      createdBy: ceoId, callerName: "CEO",
    };
    await t.mutation(internal.staffAuth.createStaffInternal, createArgs);
    const storedEmail = await t.run(async ctx => (await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", "new.designer@example.test")).first())?.email);
    expect(storedEmail).toBe("new.designer@example.test");
    const caseInsensitiveLogin = await t.query(internal.staffAuth.getStaffForLogin, { email: "NEW.DESIGNER@EXAMPLE.TEST" });
    expect(caseInsensitiveLogin?.email).toBe("new.designer@example.test");
    await expect(t.mutation(internal.staffAuth.createStaffInternal, { ...createArgs, email: "NEW.DESIGNER@example.test" }))
      .rejects.toThrow("A staff account with this email already exists.");
    await expect(t.mutation(internal.staffAuth.createStaffInternal, { ...createArgs, email: "valid@example.test", role: "superuser" }))
      .rejects.toThrow("Role must be ceo, admin, designer, or sales.");
  });

  it("normalizes every staff email and reports collisions without merging", async () => {
    const t = convexTest(schema);
    const ids = await t.run(async ctx => Promise.all([
      ctx.db.insert("staff", {
        name: "Legacy One", email: " Shared@Example.Test ", role: "designer", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      }),
      ctx.db.insert("staff", {
        name: "Legacy Two", email: "shared@example.test", role: "sales", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      }),
    ]));

    const result = await t.mutation(internal.staffAuth.normalizeStaffEmails, {});
    expect(result).toMatchObject({ scanned: 2, updated: 1 });
    expect(result.collisions).toHaveLength(1);
    expect(result.collisions[0].email).toBe("shared@example.test");
    expect(result.collisions[0].staffIds).toHaveLength(2);
    expect(result.collisions[0].staffIds).toEqual(expect.arrayContaining(ids));
    const rows = await t.run(async ctx => Promise.all(ids.map(id => ctx.db.get(id))));
    expect(rows).toHaveLength(2);
    expect(rows.map(row => row?.email)).toEqual(["shared@example.test", "shared@example.test"]);
  });

  it("CEO cannot deactivate or demote itself, and deactivation revokes target sessions", async () => {
    const t = convexTest(schema);
    const ceoToken = await seedStaff(t, "ceo");
    const ceoId = await t.run(async ctx => (await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", "ceo-permission-test@example.test")).first())!._id);
    const designerToken = "deactivation-target-token";
    let designerId: any;
    await t.run(async ctx => {
      designerId = await ctx.db.insert("staff", {
        name: "Target Designer", email: "target-designer@example.test", role: "designer", passwordHash: "h", passwordSalt: "s",
        mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: designerId, tokenHash: tokenHash(designerToken), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000,
      });
    });
    await expect(t.mutation(api.staffAuth.toggleStaffActive, { staffToken: ceoToken, targetStaffId: ceoId, isActive: false }))
      .rejects.toThrow("You cannot deactivate your own CEO account.");
    await expect(t.mutation(api.staffAuth.updateStaffRole, { staffToken: ceoToken, targetStaffId: ceoId, role: "admin" }))
      .rejects.toThrow("You cannot demote your own CEO account.");
    await t.mutation(api.staffAuth.toggleStaffActive, { staffToken: ceoToken, targetStaffId: designerId, isActive: false });
    const targetSession: any = await t.run(async ctx => await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", designerId)).first());
    expect(targetSession.revokedAt).toBeTypeOf("number");
  });
});
