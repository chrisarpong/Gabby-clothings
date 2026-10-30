import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import * as crypto from "crypto";
import schema from "./schema";
import { api } from "./_generated/api";

const hash = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
async function seed(t: any, role: string, opts: any = {}) {
  const token = `${role}-${Math.random()}`;
  await t.run(async (ctx: any) => {
    const id = await ctx.db.insert("staff", { name: role, email: `${role}@phase7.test`, role, passwordHash: "h", passwordSalt: "s", mustChangePassword: !!opts.mustChangePassword, isActive: true, failedAttempts: 0, totpEnabled: !!opts.totpEnabled, createdAt: Date.now() });
    await ctx.db.insert("staffSessions", { staffId: id, tokenHash: hash(token), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
  });
  return token;
}

describe("phase 7A incomplete staff enforcement", () => {
  it("blocks incomplete staff work while allowing profile", async () => {
    const t = convexTest(schema);
    const sales = await seed(t, "sales");
    const designer = await seed(t, "designer");
    const ceo = await seed(t, "ceo", { mustChangePassword: true, totpEnabled: true });
    await expect(t.query(api.orders.getMySales, { staffToken: sales })).rejects.toThrow("SETUP_REQUIRED");
    await expect(t.query(api.designer.getMyOrders, { staffToken: designer })).rejects.toThrow("SETUP_REQUIRED");
    await expect(t.query(api.orders.getAll, { staffToken: ceo })).rejects.toThrow("SETUP_REQUIRED");
    expect(await t.query(api.staffAuth.getStaffProfile, { staffToken: ceo })).toBeTruthy();
  });
});
