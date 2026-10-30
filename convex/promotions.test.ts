import { describe, expect, it } from "vitest";
import * as crypto from "crypto";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

async function staffToken(t: ReturnType<typeof convexTest>, role = "admin") {
  const token = `${role}-promo-token`;
  await t.run(async ctx => {
    const staffId = await ctx.db.insert("staff", { name: `${role} staff`, email: `${role}@promo.test`, role, passwordHash: "h", passwordSalt: "s", mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now() });
    await ctx.db.insert("staffSessions", { staffId, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
  });
  return token;
}

describe("promotion lifecycle", () => {
  it("updates, toggles, audits, and enforces validation and delete rules", async () => {
    const t = convexTest(schema);
    const token = await staffToken(t);
    const id = await t.mutation(api.promotions.createPromoCode, { staffToken: token, code: "SAVE20", discountType: "percentage", discountValue: 20, isActive: true });
    await t.mutation(api.promotions.updatePromoCode, { staffToken: token, id, discountValue: 15, isActive: false, minOrderAmount: 100 });
    expect((await t.query(api.promotions.getPromoCodes, { staffToken: token }))[0]).toMatchObject({ discountValue: 15, isActive: false, minOrderAmount: 100 });
    await t.mutation(api.promotions.setPromoActive, { staffToken: token, id, isActive: true });
    await expect(t.mutation(api.promotions.updatePromoCode, { staffToken: token, id, discountValue: 101, isActive: true })).rejects.toThrow("outside the allowed range");
    const logs = await t.run(ctx => ctx.db.query("adminLogs").collect());
    expect(logs.filter(log => log.category === "promotions")).toHaveLength(3);
    await t.mutation(api.promotions.deletePromoCode, { staffToken: token, id });
  });

  it("blocks deletion after redemption and enforces the promotions permission", async () => {
    const t = convexTest(schema);
    const token = await staffToken(t);
    const id = await t.run(ctx => ctx.db.insert("promotions", { code: "USED1", discountType: "fixed", discountValue: 10, isActive: true, redemptions: 1 }));
    await expect(t.mutation(api.promotions.deletePromoCode, { staffToken: token, id })).rejects.toThrow("deactivate instead");
    const salesToken = await staffToken(t, "sales");
    await expect(t.mutation(api.promotions.setPromoActive, { staffToken: salesToken, id, isActive: false })).rejects.toThrow("promotions");
  });
});
