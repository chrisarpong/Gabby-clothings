import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api, internal } from "./_generated/api";

describe("appointment file ownership index", () => {
  it("uses the index and keeps ownerId synchronized when linked", async () => {
    const t = convexTest(schema);
    const token = "appointment-file-staff";
    const { appointmentId, storageId } = await t.run(async ctx => {
      const staffId = await ctx.db.insert("staff", { name: "Admin", email: "file-admin@test", role: "admin", passwordHash: "h", passwordSalt: "s", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now() });
      await ctx.db.insert("staffSessions", { staffId, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
      const storageId = await ctx.storage.store(new Blob(["image"]));
      const appointmentId = await ctx.db.insert("appointments", { name: "Client", email: "client@test", phone: "00000", date: "2099-01-01", status: "pending", referenceImages: [storageId] });
      await ctx.db.insert("appointmentFiles", { storageId, appointmentId });
      return { appointmentId, storageId };
    });
    expect(await t.query(internal.appointments.getFileOwner, { storageId })).toEqual({ isPrivate: true, ownerId: undefined });
    await t.mutation(api.appointments.linkToUser, { staffToken: token, appointmentId, userId: "clerk-owner" });
    expect(await t.query(internal.appointments.getFileOwner, { storageId })).toEqual({ isPrivate: true, ownerId: "clerk-owner" });
    const unknown = await t.run(ctx => ctx.storage.store(new Blob(["unknown"])));
    expect(await t.query(internal.appointments.getFileOwner, { storageId: unknown })).toEqual({ isPrivate: false });
  });
});
