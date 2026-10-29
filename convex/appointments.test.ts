import { describe, expect, it, vi } from "vitest";
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
