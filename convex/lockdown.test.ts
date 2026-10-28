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

      await ctx.db.insert("exchangeRates", {
        currency: "USD",
        liveRate: 10,
        lastUpdated: Date.now(),
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

    // GHS is the base currency and cannot be manually overridden.
    await expect(
      t.mutation(api.currency.setManualRate, {
        staffToken: ceoToken,
        currency: "GHS",
        rate: 1,
      })
    ).rejects.toThrow("Invalid currency");

    // A live rate of 10 bounds manual overrides to [2, 50].
    await expect(
      t.mutation(api.currency.setManualRate, {
        staffToken: ceoToken,
        currency: "USD",
        rate: 1.99,
      })
    ).rejects.toThrow("Rate must be between");
    await expect(
      t.mutation(api.currency.setManualRate, {
        staffToken: ceoToken,
        currency: "USD",
        rate: 50.01,
      })
    ).rejects.toThrow("Rate must be between");

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

    await expect(
      t.mutation(api.settings.setSetting, {
        staffToken: ceoToken,
        key: "manualRateUSD",
        value: "99",
      })
    ).rejects.toThrow("Manual exchange rates must be changed through currency rate management");

    await t.mutation(api.currency.clearManualRate, { staffToken: ceoToken, currency: "USD" });
    const clearedRates = await t.query(api.currency.getRates, {});
    expect(clearedRates["USD"]).toBe(10);
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

  it("Task 1.7: adminLogs.logAction and getActiveSessions require authenticated staff", async () => {
    const t = convexTest(schema);

    // 1. Unauthenticated logAction fails
    await expect(
      t.mutation(api.adminLogs.logAction, {
        staffToken: "bad-token",
        action: "Updated setting",
      })
    ).rejects.toThrow();

    // 2. Unauthenticated getActiveSessions fails
    await expect(
      t.query(api.adminLogs.getActiveSessions, {
        staffToken: "bad-token",
      })
    ).rejects.toThrow();

    // 3. Authenticated staff can log action
    const staffToken = "valid-staff-log-token";
    let staffId: any;
    await t.run(async (ctx) => {
      staffId = await ctx.db.insert("staff", {
        name: "Log Admin",
        email: "logadmin@test.com",
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
        staffId,
        tokenHash: hashToken(staffToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
        ip: "127.0.0.1",
        userAgent: "MacBook Pro / Chrome",
      });
    });

    await t.mutation(api.adminLogs.logAction, {
      staffToken,
      action: "Updated settings",
      category: "settings",
    });

    const logs = await t.query(api.adminLogs.getRecentLogs, { staffToken });
    expect(logs.length).toBe(1);
    expect(logs[0].userId).toBe(staffId);
    expect(logs[0].action).toBe("Updated settings");

    const sessions = await t.query(api.adminLogs.getActiveSessions, { staffToken });
    expect(sessions.length).toBe(1);
    expect(sessions[0].userId).toBe(staffId);
  });

  it("Task 1.8: users mutations prevent spoofing identity and role escalation", async () => {
    const t = convexTest(schema);

    // 1. Unauthenticated syncUser throws
    await expect(
      t.mutation(api.users.syncUser, {
        clerkId: "spoofed_id",
        email: "spoofed@test.com",
      })
    ).rejects.toThrow("Unauthenticated");

    // 2. Customer alice cannot elevate role or spoof clerkId
    const alice = t.withIdentity({ subject: "user_alice" });
    await alice.mutation(api.users.syncUser, {
      clerkId: "user_bob",
      email: "alice@test.com",
      role: "admin",
    });

    // Check user was inserted with alice's identity and client role
    const aliceDoc = await t.run(async (ctx) => {
      return await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", "user_alice"))
        .first();
    });
    expect(aliceDoc).not.toBeNull();
    expect(aliceDoc?.clerkId).toBe("user_alice");
    expect(aliceDoc?.role).toBe("client");

    // Bob doc should not exist
    const bobDoc = await t.run(async (ctx) => {
      return await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", "user_bob"))
        .first();
    });
    expect(bobDoc).toBeNull();

    // 3. Alice cannot update Bob's profile or measurements
    await t.run(async (ctx) => {
      await ctx.db.insert("users", {
        clerkId: "user_bob",
        email: "bob@test.com",
        role: "client",
      });
    });

    await expect(
      alice.mutation(api.users.updateProfile, {
        clerkId: "user_bob",
        phone: "+233550000000",
      })
    ).rejects.toThrow("Forbidden: Cannot update another user's profile");

    await expect(
      alice.mutation(api.users.updateMeasurements, {
        clerkId: "user_bob",
        measurements: { chest: 40 },
      })
    ).rejects.toThrow("Forbidden: Cannot update another user's measurements");

    // 4. Alice can update her own profile and measurements
    await alice.mutation(api.users.updateProfile, {
      clerkId: "user_alice",
      phone: "+233551111111",
    });
    const updatedAlice = await t.run(async (ctx) => {
      return await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", "user_alice"))
        .first();
    });
    expect(updatedAlice?.phone).toBe("+233551111111");
  });

  it("Task 1.9: softReserveItems requires Clerk auth, validates bounds, and cleans up expired reserves", async () => {
    const t = convexTest(schema);

    // Setup active product and archived product
    let activeProductId: any;
    let archivedProductId: any;

    await t.run(async (ctx) => {
      activeProductId = await ctx.db.insert("products", {
        name: "Active Kaftan",
        category: "kaftans",
        description: "A lovely kaftan",
        type: "ready_to_wear",
        status: "active",
        basePrice: 200,
        stock: 50,
        images: ["kaftan.jpg"],
      });

      archivedProductId = await ctx.db.insert("products", {
        name: "Archived Kaftan",
        category: "kaftans",
        description: "Old kaftan",
        type: "ready_to_wear",
        status: "archived",
        basePrice: 200,
        stock: 50,
        images: ["old.jpg"],
      });
    });

    // 1. Unauthenticated softReserveItems throws
    await expect(
      t.mutation(api.inventory.softReserveItems, {
        items: [{ productId: activeProductId, quantity: 2 }],
      })
    ).rejects.toThrow("Authentication required: must be signed in to reserve items");

    // 2. Authenticated user with invalid quantity (> 20) throws
    const alice = t.withIdentity({ subject: "user_alice" });
    await expect(
      alice.mutation(api.inventory.softReserveItems, {
        items: [{ productId: activeProductId, quantity: 25 }],
      })
    ).rejects.toThrow("Item quantity must be an integer between 1 and 20");

    // 3. Authenticated user with archived product throws
    await expect(
      alice.mutation(api.inventory.softReserveItems, {
        items: [{ productId: archivedProductId, quantity: 2 }],
      })
    ).rejects.toThrow("Product not found or not currently active");

    // 4. Valid reserve succeeds
    await alice.mutation(api.inventory.softReserveItems, {
      items: [{ productId: activeProductId, quantity: 5 }],
    });

    // Verify count in getActiveReserves
    const count = await t.query(api.inventory.getActiveReserves, { productId: activeProductId });
    expect(count).toBe(5);

    // 5. Test cleanupExpiredReserves
    // Insert an expired reserve directly
    await t.run(async (ctx) => {
      await ctx.db.insert("activeCheckouts", {
        userId: "user_expired",
        items: [{ productId: activeProductId, quantity: 10 }],
        expiresAt: Date.now() - 5000,
      });
    });

    const cleanedCount = await t.mutation(internal.inventory.cleanupExpiredReserves, {});
    expect(cleanedCount).toBe(1);
  });

  it("Task 1.10: sequential POS orders produce sequential distinct IDs without string concatenation corruption", async () => {
    const t = convexTest(schema);

    // Setup staff with orders permission
    const staffToken = "sales-staff-token";
    await t.run(async (ctx) => {
      const staffId = await ctx.db.insert("staff", {
        name: "Sales Agent",
        email: "sales@test.com",
        role: "sales",
        passwordHash: "h",
        passwordSalt: "s",
        mustChangePassword: false,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("staffSessions", {
        staffId,
        tokenHash: hashToken(staffToken),
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
    });

    // 1. Create order 1
    const order1Id = await t.mutation(api.orders.createPOSOrder, {
      staffToken,
      customerDetails: { firstName: "Cust", lastName: "1", email: "c1@test.com" },
      items: [{ productName: "Item 1", price: 100, quantity: 1 }],
      shippingFee: 0,
      amountPaid: 100,
      amountDue: 0,
      isDeposit: false,
      paymentMethod: "cash",
    });
    const order1 = await t.run(async (ctx) => ctx.db.get(order1Id));
    expect(order1?.orderId).toBe("GB-001");

    // 2. Create order 2
    const order2Id = await t.mutation(api.orders.createPOSOrder, {
      staffToken,
      customerDetails: { firstName: "Cust", lastName: "2", email: "c2@test.com" },
      items: [{ productName: "Item 2", price: 100, quantity: 1 }],
      shippingFee: 0,
      amountPaid: 100,
      amountDue: 0,
      isDeposit: false,
      paymentMethod: "cash",
    });
    const order2 = await t.run(async (ctx) => ctx.db.get(order2Id));
    expect(order2?.orderId).toBe("GB-002");

    // 3. Create order 3
    const order3Id = await t.mutation(api.orders.createPOSOrder, {
      staffToken,
      customerDetails: { firstName: "Cust", lastName: "3", email: "c3@test.com" },
      items: [{ productName: "Item 3", price: 100, quantity: 1 }],
      shippingFee: 0,
      amountPaid: 100,
      amountDue: 0,
      isDeposit: false,
      paymentMethod: "cash",
    });
    const order3 = await t.run(async (ctx) => ctx.db.get(order3Id));
    expect(order3?.orderId).toBe("GB-003");

    // 4. Test string healing: if settings value was legacy string "15"
    await t.run(async (ctx) => {
      const setting = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", "orderCounter"))
        .first();
      await ctx.db.patch(setting!._id, { value: "15" });
    });

    const order4Id = await t.mutation(api.orders.createPOSOrder, {
      staffToken,
      customerDetails: { firstName: "Cust", lastName: "4", email: "c4@test.com" },
      items: [{ productName: "Item 4", price: 100, quantity: 1 }],
      shippingFee: 0,
      amountPaid: 100,
      amountDue: 0,
      isDeposit: false,
      paymentMethod: "cash",
    });
    const order4 = await t.run(async (ctx) => ctx.db.get(order4Id));
    expect(order4?.orderId).toBe("GB-016"); // Parsed as 15 + 1 = 16, NOT "15" + 1 = "151"

    // 5. Test NaN corruption throws
    await t.run(async (ctx) => {
      const setting = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", "orderCounter"))
        .first();
      await ctx.db.patch(setting!._id, { value: "corrupted_nan" });
    });

    await expect(
      t.mutation(api.orders.createPOSOrder, {
        staffToken,
        customerDetails: { firstName: "Cust", lastName: "5", email: "c5@test.com" },
        items: [{ productName: "Item 5", price: 100, quantity: 1 }],
        shippingFee: 0,
        amountPaid: 100,
        amountDue: 0,
        isDeposit: false,
        paymentMethod: "cash",
      })
    ).rejects.toThrow("Invalid order counter stored in database");
  });
});


