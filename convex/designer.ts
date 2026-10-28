import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireStaff } from "./staffAuth";

const PRODUCTION_STAGES = ["pending", "cutting", "stitching", "fitting", "finishing", "completed", "ready_for_pickup"] as const;

async function getTargetDesigner(ctx: any, token: string, requestedId?: Id<"staff">) {
  const staff = await requireStaff(ctx, token, { permission: "designer_portal" });
  if (requestedId && staff.role !== "ceo") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Only the CEO may select another designer." });
  }
  const designerId = requestedId ?? staff._id;
  const designer = requestedId ? await ctx.db.get(designerId) : staff;
  if (!designer || designer.role !== "designer" && designer._id !== staff._id) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Designer not found." });
  }
  return { staff, designerId };
}

async function getAssignedOrder(ctx: any, orderId: Id<"orders">, designerId: Id<"staff">) {
  const order = await ctx.db.get(orderId);
  if (!order || String(order.assignedDesignerId) !== String(designerId)) {
    throw new ConvexError({ code: "FORBIDDEN", message: "This order is not assigned to this designer." });
  }
  return order;
}

function orderSummary(order: any) {
  return {
    _id: order._id,
    orderId: order.orderId,
    items: order.items.map((item: any) => ({
      name: item.productName || item.name || "Garment",
      quantity: item.quantity,
      variantSku: item.variantSku,
      measurements: item.measurements,
    })),
    productionStatus: order.productionStatus || "pending",
    createdAt: order._creationTime,
    notes: [],
  };
}

export const getMyOrders = query({
  args: { staffToken: v.string(), designerId: v.optional(v.id("staff")) },
  handler: async (ctx, args) => {
    const { designerId } = await getTargetDesigner(ctx, args.staffToken, args.designerId);
    const orders = await ctx.db.query("orders")
      .withIndex("by_assignedDesigner", q => q.eq("assignedDesignerId", designerId))
      .order("desc")
      .take(200);
    return await Promise.all(orders.map(async order => {
      const activity = await ctx.db.query("orderActivityLog")
        .withIndex("by_order", q => q.eq("orderId", order._id))
        .order("desc")
        .take(50);
      const notes = activity.filter(row => row.stage === "note" || row.note).slice(0, 10).map(row => ({
        note: row.note,
        createdAt: row.timestamp,
      }));
      return { ...orderSummary(order), notes };
    }));
  },
});

export const getMyAppointments = query({
  args: { staffToken: v.string(), designerId: v.optional(v.id("staff")) },
  handler: async (ctx, args) => {
    const { designerId } = await getTargetDesigner(ctx, args.staffToken, args.designerId);
    const appointments = await ctx.db.query("appointments")
      .withIndex("by_assignedStaff", q => q.eq("assignedStaffId", designerId))
      .order("desc")
      .take(200);
    return appointments.map(appointment => ({
      _id: appointment._id,
      name: appointment.name,
      phone: appointment.phone,
      date: appointment.date,
      time: appointment.time,
      garmentType: appointment.garmentType,
      appointmentType: appointment.appointmentType,
      status: appointment.status,
      notes: appointment.notes,
      adminNotes: appointment.adminNotes,
      measurementsCaptured: appointment.measurementsCaptured,
      linkedOrderId: appointment.linkedOrderId,
      createdAt: appointment._creationTime,
    }));
  },
});

export const getMyHistory = query({
  args: { staffToken: v.string(), designerId: v.optional(v.id("staff")) },
  handler: async (ctx, args) => {
    const { designerId } = await getTargetDesigner(ctx, args.staffToken, args.designerId);
    const orders = await ctx.db.query("orders")
      .withIndex("by_assignedDesigner", q => q.eq("assignedDesignerId", designerId))
      .order("desc")
      .take(200);
    return orders
      .filter(order => order.productionStatus === "completed" || order.productionStatus === "ready_for_pickup" || order.status === "delivered")
      .map(orderSummary);
  },
});

export const getClientMeasurements = query({
  args: {
    staffToken: v.string(),
    orderId: v.optional(v.id("orders")),
    appointmentId: v.optional(v.id("appointments")),
    designerId: v.optional(v.id("staff")),
  },
  handler: async (ctx, args) => {
    if (Boolean(args.orderId) === Boolean(args.appointmentId)) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Provide exactly one orderId or appointmentId." });
    }
    const { designerId } = await getTargetDesigner(ctx, args.staffToken, args.designerId);
    let clerkId: string | undefined;
    if (args.orderId) {
      const order = await getAssignedOrder(ctx, args.orderId, designerId);
      clerkId = order.userId;
    } else if (args.appointmentId) {
      const appointment = await ctx.db.get(args.appointmentId);
      if (!appointment || appointment.assignedStaffId !== designerId) {
        throw new ConvexError({ code: "FORBIDDEN", message: "This appointment is not assigned to this designer." });
      }
      clerkId = appointment.userId;
    }
    if (!clerkId) return null;
    const customer = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", clerkId!)).first();
    return customer?.savedMeasurements ?? null;
  },
});

export const updateMyOrderProduction = mutation({
  args: {
    staffToken: v.string(),
    orderId: v.id("orders"),
    productionStatus: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "designer_portal" });
    if (staff.role !== "designer") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Only a designer can update assigned production work." });
    }
    if (!(PRODUCTION_STAGES as readonly string[]).includes(args.productionStatus)) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Invalid production stage." });
    }
    await getAssignedOrder(ctx, args.orderId, staff._id);
    await ctx.db.patch(args.orderId, { productionStatus: args.productionStatus });
    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: args.productionStatus,
      performedBy: staff._id,
      note: args.note,
      timestamp: Date.now(),
    });
  },
});
