import { internalMutation } from "./_generated/server";

export const cleanupSmsRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // 1. Delete staffPasswordResets older than 7 days (batches of 500 using by_createdAt)
    const oldResets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", sevenDaysAgo))
      .take(500);

    for (const reset of oldResets) {
      await ctx.db.delete(reset._id);
    }

    // 2. Delete staffSmsLog older than 30 days (batches of 500 using by_createdAt)
    const oldLogs = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", thirtyDaysAgo))
      .take(500);

    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    // 3. Delete devSmsOutbox older than 1 day (batches of 500 using by_createdAt)
    const oldDevOutbox = await ctx.db
      .query("devSmsOutbox")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", oneDayAgo))
      .take(500);

    for (const msg of oldDevOutbox) {
      await ctx.db.delete(msg._id);
    }

    return {
      deletedResets: oldResets.length,
      deletedLogs: oldLogs.length,
      deletedDevOutbox: oldDevOutbox.length,
    };
  },
});

