import { query } from "./_generated/server";
import { requireAdmin } from "./users";

export const getDashboardStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const orders = await ctx.db.query("orders").collect();
    const totalOrders = orders.length;

    const totalRevenue = orders
      .filter((o) => o.status === "completed" || o.status === "shipped")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const clients = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "customer"))
      .collect();
    const totalClients = clients.length;

    return {
      totalRevenue,
      totalOrders,
      totalClients,
    };
  },
});
