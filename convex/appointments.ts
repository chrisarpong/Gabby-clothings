import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const book = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    garmentType: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Optionally link to identity if available
    const identity = await ctx.auth.getUserIdentity();
    
    // Check Availability Settings
    const availabilitySetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "availability"))
      .first();

    if (availabilitySetting && availabilitySetting.value && args.time) {
      const { workingDays, startHour, endHour } = availabilitySetting.value;
      const appointmentDate = new Date(`${args.date}T${args.time}`);
      const dayOfWeek = appointmentDate.getDay(); // 0 is Sunday

      if (workingDays && !workingDays.includes(dayOfWeek)) {
        throw new Error("We are not open on this day of the week.");
      }

      if (startHour && endHour) {
        if (args.time < startHour || args.time > endHour) {
          throw new Error(`Please select a time between ${startHour} and ${endHour}.`);
        }
      }
    }
    
    const appointmentId = await ctx.db.insert("appointments", {
      ...args,
      userId: identity ? identity.subject : undefined,
      status: "pending",
    });

    // Create 24h Reminder
    if (args.time) {
      const appointmentTime = new Date(`${args.date}T${args.time}`);
      // Subtract 24 hours
      const reminderTime = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
      
      // Only schedule if it's in the future
      if (reminderTime > new Date()) {
        await ctx.db.insert("reminders", {
          appointmentId: appointmentId,
          scheduledFor: reminderTime.toISOString(),
          status: "pending",
          type: "24h_reminder",
        });
      }
    }

    return appointmentId;
  },
});

export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.email !== "christiananietie10@gmail.com" && (identity as any).role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }
    return await ctx.db.query("appointments").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.email !== "christiananietie10@gmail.com" && (identity as any).role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }
    
    await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});

export const sendReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    
    // Find all pending reminders that are due
    const dueReminders = await ctx.db
      .query("reminders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.lte(q.field("scheduledFor"), now))
      .collect();

    for (const reminder of dueReminders) {
      const appointment = await ctx.db.get(reminder.appointmentId);
      if (appointment && appointment.status !== 'cancelled') {
        // Here you would integrate Resend, Sendgrid, etc.
        console.log(`[EMAIL DISPATCH] Sending 24h reminder to ${appointment.email} for appointment on ${appointment.date} at ${appointment.time}`);
      }
      
      // Mark as sent
      await ctx.db.patch(reminder._id, { status: "sent" });
    }
  },
});
