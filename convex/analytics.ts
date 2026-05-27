import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // if (!identity || (identity as any).role !== "admin") throw new Error("Unauthorized");

    const orders = await ctx.db.query("orders").collect();
    
    let totalRevenue = 0;
    let activeOrders = 0;

    for (const o of orders) {
      if (o.status !== "cancelled") {
        totalRevenue += o.totalAmount;
      }
      if (o.status === "pending" || o.status === "processing") {
        activeOrders++;
      }
    }

    // Top sellers is a bit manual
    const productCounts: Record<string, number> = {};
    for (const o of orders) {
      for (const item of o.items) {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
      }
    }

    const topProductIds = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    const topSellers = [];
    for (const pid of topProductIds) {
      const p = await ctx.db.get(pid as any);
      if (p) topSellers.push(p);
    }

    return {
      totalRevenue,
      activeOrders,
      topSellers,
    };
  }
});
