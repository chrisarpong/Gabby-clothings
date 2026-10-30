import { describe, expect, it, afterEach } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api } from "./_generated/api";

const originalSite = process.env.CONVEX_SITE_URL;
const originalSecret = process.env.FILE_LINK_SECRET;
afterEach(() => {
  if (originalSite === undefined) delete process.env.CONVEX_SITE_URL; else process.env.CONVEX_SITE_URL = originalSite;
  if (originalSecret === undefined) delete process.env.FILE_LINK_SECRET; else process.env.FILE_LINK_SECRET = originalSecret;
});

async function seed(t: ReturnType<typeof convexTest>, role: "admin" | "sales") {
  const token = `${role}-file-token`;
  const storageId = await t.run(async ctx => {
    const staffId = await ctx.db.insert("staff", { name: role, email: `${role}@test`, role, passwordHash: "h", passwordSalt: "s", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now() });
    await ctx.db.insert("staffSessions", { staffId, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
    const storageId = await ctx.storage.store(new Blob(["private"]));
    const appointmentId = await ctx.db.insert("appointments", { name: "Client", email: "client@test", phone: "00000", date: "2099-01-01", status: "pending", referenceImages: [storageId] });
    await ctx.db.insert("appointmentFiles", { storageId, appointmentId });
    return storageId;
  });
  return { token, storageId };
}

describe("staff file link mutation", () => {
  it("allows appointments staff and uses the Convex site host", async () => {
    process.env.CONVEX_SITE_URL = "https://convex-test.site";
    process.env.FILE_LINK_SECRET = "test-secret";
    const t = convexTest(schema);
    const { token, storageId } = await seed(t, "admin");
    const url = await t.mutation(api.appointments.createStaffFileLink, { staffToken: token, storageId });
    expect(url.startsWith("https://convex-test.site/getFile?")).toBe(true);
    expect(url).toContain("sig=");
    expect(url).toContain("exp=");
  });

  it("denies sales and fails closed without the signing secret", async () => {
    process.env.CONVEX_SITE_URL = "https://convex-test.site";
    const t = convexTest(schema);
    const admin = await seed(t, "admin");
    const sales = await seed(t, "sales");
    await expect(t.mutation(api.appointments.createStaffFileLink, { staffToken: sales.token, storageId: sales.storageId })).rejects.toThrow();
    delete process.env.FILE_LINK_SECRET;
    await expect(t.mutation(api.appointments.createStaffFileLink, { staffToken: admin.token, storageId: admin.storageId })).rejects.toThrow("Private staff file links are not configured");
  });
});
