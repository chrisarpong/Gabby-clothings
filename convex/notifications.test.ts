import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

describe("notification ownership", () => {
  it("allows the owner and rejects another signed-in user", async () => {
    const t = convexTest(schema);
    let notificationId: any;
    await t.run(async (ctx) => {
      const owner = await ctx.db.insert("users", { clerkId: "notification-owner", email: "owner@example.test", role: "client" });
      const other = await ctx.db.insert("users", { clerkId: "notification-other", email: "other@example.test", role: "client" });
      notificationId = await ctx.db.insert("notifications", { userId: owner, type: "order", title: "Order", body: "Ready", read: false, createdAt: Date.now() });
      expect(other).toBeTruthy();
    });
    await t.withIdentity({ subject: "notification-owner" }).mutation(api.notifications.markAsRead, { notificationId });
    expect(await t.run(ctx => ctx.db.get(notificationId))).toMatchObject({ read: true });

    await t.run(ctx => ctx.db.patch(notificationId, { read: false }));
    await expect(t.withIdentity({ subject: "notification-other" }).mutation(api.notifications.markAsRead, { notificationId })).rejects.toThrow("Forbidden");
    expect(await t.run(ctx => ctx.db.get(notificationId))).toMatchObject({ read: false });
  });
});
