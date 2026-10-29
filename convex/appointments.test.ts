import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";

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

describe("expired appointment payment revival", () => {
  async function expired(t: any, reference: string, time = "10:00") {
    return await t.run(async (ctx: any) => ctx.db.insert("appointments", { name: "Expired Client", email: "client@example.test", phone: "0240000000", date: "2099-11-01", time, status: "expired", paymentStatus: "expired", expectedAmountPesewas: 5000, paystackReference: reference, paymentExpiresAt: Date.now() - 1000 }));
  }

  it("revives an expired appointment when its slot remains free", async () => {
    const t = convexTest(schema);
    const appointmentId = await expired(t, "EXPIRED-FREE");
    await t.mutation(internal.appointments.finalizeAppointmentPayment, { appointmentId, reference: "EXPIRED-FREE", amountPesewas: 5000, currency: "GHS" });
    const appointment: any = await t.run(async (ctx: any) => ctx.db.get(appointmentId));
    expect(appointment.status).toBe("confirmed");
    expect(appointment.paymentStatus).toBe("paid");
  });

  it("records paid_but_slot_taken instead of confirming a claimed slot", async () => {
    const t = convexTest(schema);
    const appointmentId = await expired(t, "EXPIRED-TAKEN", "10:00");
    await t.run(async (ctx: any) => ctx.db.insert("appointments", { name: "Other Client", email: "other@example.test", phone: "0240000001", date: "2099-11-01", time: "10:00", status: "confirmed", paymentStatus: "paid", expectedAmountPesewas: 5000 }));
    const result = await t.mutation(internal.appointments.finalizeAppointmentPayment, { appointmentId, reference: "EXPIRED-TAKEN", amountPesewas: 5000, currency: "GHS" });
    expect(result).toBeNull();
    const state: any = await t.run(async (ctx: any) => ({ appointment: await ctx.db.get(appointmentId), issues: await ctx.db.query("paymentIssues").collect() }));
    expect(state.appointment.paymentStatus).toBe("expired");
    expect(state.issues[0].kind).toBe("paid_but_slot_taken");
  });

  it("does not let an expired awaiting payment block availability before cron", async () => {
    const t = convexTest(schema);
    await t.run(async (ctx: any) => {
      await ctx.db.insert("settings", { key: "availability", value: { workingDays: [0, 1, 2, 3, 4, 5, 6], startHour: "09:00", endHour: "17:00", lunchStart: "12:00", lunchEnd: "13:00", bufferTime: 30 } });
      await ctx.db.insert("appointments", { name: "Waiting", email: "waiting@example.test", phone: "0240000000", date: "2099-11-01", time: "10:00", status: "pending", paymentStatus: "awaiting_payment", paymentExpiresAt: Date.now() - 1000 });
    });
    const slots = await t.query(api.appointments.getAvailableSlots, { date: "2099-11-01" });
    expect(slots).toContain("10:00");
  });
});
