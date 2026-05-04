import { cronJobs } from "convex/server";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const cleanupAbandonedOrders = mutation({
  handler: async (ctx) => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const pendingOrders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    for (const order of pendingOrders) {
      if (order._creationTime < twentyFourHoursAgo) {
        await ctx.db.patch(order._id, { status: "cancelled" });
      }
    }
  },
});

const crons = cronJobs();

crons.daily(
  "Cleanup abandoned checkouts",
  { hourUTC: 0, minuteUTC: 0 },
  api.crons.cleanupAbandonedOrders
);

export default crons;
