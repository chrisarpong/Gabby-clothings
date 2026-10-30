import { describe, expect, it } from "vitest";
import * as crypto from "crypto";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

async function seed(t: ReturnType<typeof convexTest>, role: string, suffix: string) {
  const token = `${role}-${suffix}`;
  await t.run(async ctx => {
    const id = await ctx.db.insert("staff", { name: role, email: `${role}-${suffix}@test`, role, passwordHash: "h", passwordSalt: "s", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now() });
    await ctx.db.insert("staffSessions", { staffId: id, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
    return id;
  });
  return token;
}

describe("sales CRM scoping", () => {
  it("sales sees only own clients while admin sees all and no measurements", async () => {
    const t = convexTest(schema);
    const sales = await seed(t, "sales", "one");
    const other = await seed(t, "sales", "two");
    const admin = await seed(t, "admin", "one");
    await t.run(async ctx => {
      const staff = await ctx.db.query("staff").collect();
      const first = staff.find(row => row.email.startsWith("sales-one"))!;
      const second = staff.find(row => row.email.startsWith("sales-two"))!;
      await ctx.db.insert("orders", { createdByStaffId: first._id, customerDetails: { firstName: "A", lastName: "Client", email: "a@example.test", phone: "111" }, items: [], totalAmount: 100, amountPaid: 60, amountDue: 40, status: "processing", userId: "a", paymentStatus: "partial" });
      await ctx.db.insert("orders", { createdByStaffId: second._id, customerDetails: { firstName: "B", lastName: "Client", email: "b@example.test" }, items: [], totalAmount: 200, amountPaid: 200, amountDue: 0, status: "processing", userId: "b", paymentStatus: "paid" });
    });
    const own = await t.query(api.orders.getMyClients, { staffToken: sales });
    expect(own.map(client => client.email)).toEqual(["a@example.test"]);
    expect(own[0]).not.toHaveProperty("savedMeasurements");
    expect((await t.query(api.orders.getMyClients, { staffToken: other })).map(client => client.email)).toEqual(["b@example.test"]);
    expect((await t.query(api.orders.getMyClients, { staffToken: admin })).map(client => client.email).sort()).toEqual(["a@example.test", "b@example.test"]);
  });

  it("keeps a sales user's clients visible beyond other staff's first 500 orders", async () => {
    const t = convexTest(schema);
    const sales = await seed(t, "sales", "indexed");
    const salesId = await t.run(async ctx => (await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", "sales-indexed@test")).first())!._id);
    await t.run(async ctx => {
      for (let i = 0; i < 600; i++) await ctx.db.insert("orders", { createdByStaffId: salesId, customerDetails: { firstName: "Target", lastName: "Client", email: "target@example.test" }, items: [], totalAmount: 10, amountPaid: 10, amountDue: 0, status: "processing" });
    });
    const clients = await t.query(api.orders.getMyClients, { staffToken: sales });
    expect(clients.some(client => client.email === "target@example.test")).toBe(true);
  });
});
