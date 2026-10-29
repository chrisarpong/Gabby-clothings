import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

function paystackSuccess(reference: string, amount = 5000) {
  return { ok: true, json: async () => ({ status: true, data: { status: "success", reference, amount, currency: "GHS" } }) };
}

async function seedAppointment(t: any, userId?: string) {
  return await t.run(async (ctx: any) => ctx.db.insert("appointments", { userId, name: "Client", email: "client@example.test", phone: "0240000000", date: "2099-11-01", status: "pending", paymentStatus: "awaiting_payment", expectedAmountPesewas: 5000, paystackReference: "APT-SERVER-REF" }));
}

describe("appointment payment authorization", () => {
  it("allows the signed-in owner and returns only status and appointmentId", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_appointment";
    vi.stubGlobal("fetch", vi.fn(async () => paystackSuccess("APT-SERVER-REF")));
    const t = convexTest(schema).withIdentity({ subject: "user_owner" });
    const appointmentId = await seedAppointment(t, "user_owner");
    const result = await t.action(api.appointments.verifyAppointmentPayment, { appointmentId, reference: "APT-SERVER-REF" });
    expect(result).toEqual({ status: "success", appointmentId });
  });

  it("allows a guest only with the server reference pair", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_appointment";
    vi.stubGlobal("fetch", vi.fn(async () => paystackSuccess("APT-SERVER-REF")));
    const t = convexTest(schema);
    const appointmentId = await seedAppointment(t);
    const result = await t.action(api.appointments.verifyAppointmentPayment, { appointmentId, reference: "APT-SERVER-REF" });
    expect(result.status).toBe("success");
  });

  it("rejects a guest with a wrong reference", async () => {
    const t = convexTest(schema);
    const appointmentId = await seedAppointment(t);
    await expect(t.action(api.appointments.verifyAppointmentPayment, { appointmentId, reference: "WRONG-REF" })).rejects.toThrow();
  });

  it("rejects a signed-in non-owner", async () => {
    const t = convexTest(schema).withIdentity({ subject: "user_other" });
    const appointmentId = await seedAppointment(t, "user_owner");
    await expect(t.action(api.appointments.verifyAppointmentPayment, { appointmentId, reference: "APT-SERVER-REF" })).rejects.toThrow();
  });
});

describe("appointment rescheduling authorization", () => {
  async function seed(t: any, userId = "user_owner", time = "10:00", date = "2026-11-10") {
    return await t.run(async (ctx: any) => ctx.db.insert("appointments", { userId, name: "Client", email: "client@example.test", phone: "0240000000", date, time, status: "confirmed", paymentStatus: "paid" }));
  }

  async function staffToken(t: any) {
    return await t.run(async (ctx: any) => {
      const staffId = await ctx.db.insert("staff", { name: "Admin", email: "admin@example.test", role: "admin", isActive: true, passwordHash: "x", passwordSalt: "x", mustChangePassword: false, totpEnabled: false, failedAttempts: 0, createdAt: Date.now() });
      const token = "staff-reschedule-token";
      await ctx.db.insert("staffSessions", { staffId, tokenHash: createHash("sha256").update(token).digest("hex"), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000, ip: "test", userAgent: "test" });
      return token;
    });
  }

  it("rejects a non-owner", async () => {
    const t = convexTest(schema).withIdentity({ subject: "user_other" });
    const appointmentId = await seed(t);
    await expect(t.mutation(api.appointments.reschedule, { appointmentId, date: "2026-11-11", time: "11:00" })).rejects.toThrow();
  });

  it("allows the owner and staff, while rejecting a taken or past slot", async () => {
    const t = convexTest(schema).withIdentity({ subject: "user_owner" });
    const appointmentId = await seed(t);
    await t.mutation(api.appointments.reschedule, { appointmentId, date: "2026-11-11", time: "11:00" });
    const token = await staffToken(t);
    await t.mutation(api.appointments.reschedule, { appointmentId, staffToken: token, date: "2026-11-12", time: "12:00" });
    const taken = await seed(t, "other", "14:00", "2026-11-12");
    await expect(t.mutation(api.appointments.reschedule, { appointmentId, date: "2026-11-12", time: "14:00" })).rejects.toThrow();
    await expect(t.mutation(api.appointments.reschedule, { appointmentId: taken, date: "2020-01-01", time: "10:00" })).rejects.toThrow();
  });
});
