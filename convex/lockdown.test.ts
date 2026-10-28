import { describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import * as crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

describe("Phase 1 Security Tests", () => {
  const originalEnv = process.env.ALLOW_DATA_WIPE;

  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString("base64");
  });

  afterEach(() => {
    process.env.ALLOW_DATA_WIPE = originalEnv;
  });

  it("Task 1.1: wipeTestData rejects execution when ALLOW_DATA_WIPE is not true", async () => {
    delete process.env.ALLOW_DATA_WIPE;
    const t = convexTest(schema);

    await expect(
      t.mutation(internal.wipeData.wipeTestData, { confirmWipe: true })
    ).rejects.toThrow("ALLOW_DATA_WIPE is not set to 'true'");
  });

  it("Task 1.2: decrementStock works internally", async () => {
    const t = convexTest(schema);
    const productId = await t.run(async (ctx) => {
      return await ctx.db.insert("products", {
        name: "Test Shirt",
        slug: "test-shirt",
        category: "shirts",
        description: "A comfortable test shirt",
        type: "ready_to_wear",
        status: "active",
        basePrice: 100,
        stock: 10,
        images: ["test.jpg"],
      });
    });

    await t.mutation(internal.inventory.decrementStock, {
      items: [{ productId, quantity: 3 }],
    });

    const product = await t.run(async (ctx) => {
      return await ctx.db.get(productId);
    });
    expect(product?.stock).toBe(7);
  });

  it("Task 1.3: payments.getByOrder requires staffToken with financials permission", async () => {
    const t = convexTest(schema);

    const orderId = await t.run(async (ctx) => {
      return await ctx.db.insert("orders", {
        orderId: "ORD-001",
        customerDetails: {
          email: "cust@test.com",
          firstName: "Customer",
          lastName: "One",
        },
        items: [],
        totalAmount: 500,
        amountPaid: 200,
        amountDue: 300,
        displayCurrency: "GHS",
        status: "pending",
        paymentStatus: "partial",
        paymentMethod: "cash",
      });
    });

    // 1. Call with fake/invalid token -> fails
    await expect(
      t.query(api.payments.getByOrder, { staffToken: "invalid-token", orderId })
    ).rejects.toThrow();

    // 2. Call with admin (no financials permission) -> fails
    const adminToken = "admin-secret-token";
    await t.run(async (ctx) => {
      const staffId = await ctx.db.insert("staff", {
        name: "Admin Staff",
        email: "admin@test.com",
        role: "admin",
        passwordHash: "hash",
        passwordSalt: "salt",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId,
        tokenHash: await hashToken(adminToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
    });

    await expect(
      t.query(api.payments.getByOrder, { staffToken: adminToken, orderId })
    ).rejects.toThrow("Unauthorized: Requires financials");

    // 3. Call with ceo (has financials permission) -> succeeds
    const ceoToken = "ceo-secret-token";
    await t.run(async (ctx) => {
      const staffId = await ctx.db.insert("staff", {
        name: "CEO Staff",
        email: "ceo@test.com",
        role: "ceo",
        passwordHash: "hash",
        passwordSalt: "salt",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId,
        tokenHash: await hashToken(ceoToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
      await ctx.db.insert("payments", {
        orderId,
        amount: 200,
        paymentMethod: "cash",
        recordedBy: staffId,
        date: new Date().toISOString(),
      });
    });

    const payments = await t.query(api.payments.getByOrder, { staffToken: ceoToken, orderId });
    expect(payments.length).toBe(1);
    expect(payments[0].amount).toBe(200);
  });

  it("Task 1.4: currency.setManualRate validates permissions, currencies, rates, and expiry", async () => {
    const t = convexTest(schema);

    // Setup staff: one admin (no financials), one ceo (has financials)
    const adminToken = "admin-currency-token";
    const ceoToken = "ceo-currency-token";

    await t.run(async (ctx) => {
      const adminId = await ctx.db.insert("staff", {
        name: "Admin",
        email: "admin-curr@test.com",
        role: "admin",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: adminId,
        tokenHash: hashToken(adminToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });

      const ceoId = await ctx.db.insert("staff", {
        name: "CEO",
        email: "ceo-curr@test.com",
        role: "ceo",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: ceoId,
        tokenHash: hashToken(ceoToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
    });

    // 1. Admin without financials is forbidden
    await expect(
      t.mutation(api.currency.setManualRate, {
        staffToken: adminToken,
        currency: "USD",
        rate: 15.5,
      })
    ).rejects.toThrow("Unauthorized: Requires financials");

    // 2. CEO with invalid currency is rejected
    await expect(
      t.mutation(api.currency.setManualRate, {
        staffToken: ceoToken,
        currency: "BITCOIN",
        rate: 15.5,
      })
    ).rejects.toThrow("Invalid currency");

    // 3. Rate <= 0 is rejected
    await expect(
      t.mutation(api.currency.setManualRate, {
        staffToken: ceoToken,
        currency: "USD",
        rate: -1,
      })
    ).rejects.toThrow("Rate must be a positive finite number");

    // 4. Past expiry is rejected
    await expect(
      t.mutation(api.currency.setManualRate, {
        staffToken: ceoToken,
        currency: "USD",
        rate: 15.5,
        manualRateExpiry: Date.now() - 1000,
      })
    ).rejects.toThrow("Manual rate expiry must be in the future");

    // 5. Valid call succeeds
    const futureExpiry = Date.now() + 86400000;
    await t.mutation(api.currency.setManualRate, {
      staffToken: ceoToken,
      currency: "USD",
      rate: 15.75,
      manualRateExpiry: futureExpiry,
    });

    // Verify rate in database
    const rates = await t.query(api.currency.getRates, {});
    expect(rates["USD"]).toBe(15.75);
  });

  it("Task 1.5: catalogs.seed works as internal mutation", async () => {
    const t = convexTest(schema);

    await t.mutation(internal.catalogs.seed, {});

    const catalogs = await t.run(async (ctx) => {
      return await ctx.db.query("catalogs").collect();
    });
    expect(catalogs.length).toBe(3);
    expect(catalogs.some((c) => c.slug === "summer-2026")).toBe(true);
  });

  it("Task 1.6: orderActivity.getByOrder requires staffToken and allows orders or designer_portal permission", async () => {
    const t = convexTest(schema);

    const orderId = await t.run(async (ctx) => {
      return await ctx.db.insert("orders", {
        orderId: "GB-101",
        totalAmount: 100,
        status: "processing",
        items: [],
      });
    });

    const adminToken = "admin-order-token";
    const designerToken = "designer-order-token";

    await t.run(async (ctx) => {
      const adminId = await ctx.db.insert("staff", {
        name: "Admin",
        email: "admin-oa@test.com",
        role: "admin",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: adminId,
        tokenHash: hashToken(adminToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });

      const designerId = await ctx.db.insert("staff", {
        name: "Designer",
        email: "designer-oa@test.com",
        role: "designer",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId: designerId,
        tokenHash: hashToken(designerToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });

      await ctx.db.insert("orderActivityLog", {
        orderId,
        stage: "cutting",
        performedBy: designerId,
        timestamp: Date.now(),
        note: "Fabric cut",
      });
    });

    // 1. Invalid token throws
    await expect(
      t.query(api.orderActivity.getByOrder, {
        staffToken: "invalid-token",
        orderId,
      })
    ).rejects.toThrow();

    // 2. Admin (orders permission) succeeds
    const adminLogs = await t.query(api.orderActivity.getByOrder, {
      staffToken: adminToken,
      orderId,
    });
    expect(adminLogs.length).toBe(1);
    expect(adminLogs[0].stage).toBe("cutting");

    // 3. Designer (designer_portal permission) succeeds
    const designerLogs = await t.query(api.orderActivity.getByOrder, {
      staffToken: designerToken,
      orderId,
    });
    expect(designerLogs.length).toBe(1);
  });
});


