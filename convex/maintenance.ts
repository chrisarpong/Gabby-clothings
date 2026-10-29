import { internalMutation } from "./_generated/server";

export const cleanupPendingCheckoutSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rows = await ctx.db.query("checkoutSessions").withIndex("by_status_createdAt", q => q.eq("status", "pending").lt("createdAt", cutoff)).take(500);
    let deleted = 0;
    for (const row of rows) {
      await ctx.db.delete(row._id); deleted++;
    }
    return deleted;
  },
});

export const cleanupRateLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const rows = await ctx.db.query("rateLimits").take(500);
    let deleted = 0;
    for (const row of rows) {
      if (row.lastAttempt < cutoff) { await ctx.db.delete(row._id); deleted++; }
    }
    return deleted;
  },
});
