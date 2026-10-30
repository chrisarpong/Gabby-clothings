import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api } from "./_generated/api";

async function seed(t: ReturnType<typeof convexTest>, role: "designer" | "ceo", token: string) {
  return t.run(async ctx => {
    const staffId = await ctx.db.insert("staff", { name: role, email: `${role}-${token}@test`, role, passwordHash: "h", passwordSalt: "s", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: false, createdAt: Date.now() });
    await ctx.db.insert("staffSessions", { staffId, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
    const storageId = await ctx.storage.store(new Blob(["image"]));
    const appointmentId = await ctx.db.insert("appointments", { name: "Client", email: "client@test", phone: "00000", date: "2099-01-01", status: "pending", assignedStaffId: staffId, referenceImages: [storageId] });
    await ctx.db.insert("appointmentFiles", { storageId, appointmentId });
    return { staffId, storageId };
  });
}

describe("designer file links", () => {
  it("only allows the assigned designer", async () => {
    process.env.CONVEX_SITE_URL = "https://convex-test.site";
    process.env.FILE_LINK_SECRET = "designer-secret";
    const t = convexTest(schema);
    const own = await seed(t, "designer", "designer-own");
    const other = await seed(t, "designer", "designer-other");
    const url = await t.mutation(api.designer.createFileLink, { staffToken: "designer-own", storageId: own.storageId });
    expect(url).toContain("sig=");
    await expect(t.mutation(api.designer.createFileLink, { staffToken: "designer-other", storageId: own.storageId })).rejects.toThrow();
    const unknown = await t.run(ctx => ctx.storage.store(new Blob(["unknown"])));
    await expect(t.mutation(api.designer.createFileLink, { staffToken: "designer-own", storageId: unknown })).rejects.toThrow();
    void other;
  });
});
