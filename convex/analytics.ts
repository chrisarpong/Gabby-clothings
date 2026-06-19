import { query } from "./_generated/server";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null; // Auth token not synced yet — return null, don't throw

    // Check admin role — return null if not admin (frontend already gates access)
    const adminRoles = ["admin", "superadmin"];
    if (!adminRoles.includes(identity?.role as string)) {
      const user = await ctx.db.query("users").withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject)).first();
      if (!user || !adminRoles.includes(user.role)) return null;
    }

    const orders = await ctx.db.query("orders").collect();
    const users = await ctx.db.query("users").collect();
    const appointments = await ctx.db.query("appointments").collect();
    
    let totalRevenue = 0;
    let activeOrders = 0;

    for (const o of orders) {
      if (o.status !== "cancelled") {
        totalRevenue += o.totalAmount || 0;
      }
      if (o.status === "pending" || o.status === "processing") {
        activeOrders++;
      }
    }

    const pendingAppointments = appointments.filter(a => a.status === "pending" || a.status === "confirmed");

    // Monthly revenue for the last 6 months
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue: { name: string; revenue: number; orders: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.getTime();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      
      let rev = 0;
      let count = 0;
      for (const o of orders) {
        if (o._creationTime >= monthStart && o._creationTime < monthEnd && o.status !== "cancelled") {
          rev += o.totalAmount || 0;
          count++;
        }
      }
      monthlyRevenue.push({ name: monthNames[d.getMonth()], revenue: rev, orders: count });
    }

    // Recent activity (last 5 orders)
    const recentOrders = [...orders]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);

    const recentActivity = recentOrders.map(o => ({
      action: o.status === "processing" ? "New order placed" : `Order ${o.status}`,
      client: `${o.customerDetails?.firstName || "Guest"} ${o.customerDetails?.lastName || ""}`.trim(),
      time: getRelativeTime(o._creationTime),
      amount: `GH₵${(o.totalAmount || 0).toLocaleString()}`,
    }));

    return {
      totalRevenue,
      totalOrders: orders.length,
      activeOrders,
      totalClients: users.length,
      upcomingAppointments: pendingAppointments.length,
      monthlyRevenue,
      recentActivity,
    };
  }
});

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
