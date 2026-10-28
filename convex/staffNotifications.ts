import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireStaff } from "./staffAuth";
import { hasPermission, StaffRole } from "./staffPermissions";

export const getFeed = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken);
    const role = staff.role as StaffRole;
    const items: { type: string; title: string; createdAt: number; tab: string }[] = [];
    const counts = { messages: 0, appointments: 0, orders: 0 };

    if (hasPermission(role, "messages")) {
      const unreadMessages = await ctx.db.query("messages")
        .withIndex("by_status", q => q.eq("status", "unread"))
        .collect();
      counts.messages = unreadMessages.length;
      items.push(...unreadMessages.slice(-10).map(message => ({
        type: "message",
        title: `Unread message: ${message.subject}`,
        createdAt: message._creationTime,
        tab: "messages",
      })));
    }

    if (hasPermission(role, "appointments")) {
      const pendingAppointments = await ctx.db.query("appointments")
        .withIndex("by_status", q => q.eq("status", "pending"))
        .collect();
      counts.appointments = pendingAppointments.length;
      items.push(...pendingAppointments.slice(-10).map(appointment => ({
        type: "appointment",
        title: `Pending appointment: ${appointment.date}`,
        createdAt: appointment._creationTime,
        tab: "appointments",
      })));
    }

    if (hasPermission(role, "orders")) {
      const pending = await ctx.db.query("orders")
        .withIndex("by_status", q => q.eq("status", "pending"))
        .collect();
      const processing = await ctx.db.query("orders")
        .withIndex("by_status", q => q.eq("status", "processing"))
        .collect();
      const newOrders = [...pending, ...processing];
      counts.orders = newOrders.length;
      items.push(...newOrders.slice(-10).map(order => ({
        type: "order",
        title: `Unprocessed order: ${order.orderId || String(order._id)}`,
        createdAt: order._creationTime,
        tab: "orders",
      })));
    }

    return {
      counts: { ...counts, total: counts.messages + counts.appointments + counts.orders },
      items: items.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10),
    };
  },
});
