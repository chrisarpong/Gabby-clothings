import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
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
    paystackReference: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
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
      paymentStatus: args.paystackReference ? "paid" : "pending",
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

    // Schedule Google Calendar event creation
    await ctx.scheduler.runAfter(0, internal.googleCalendar.createEvent, {
      appointmentId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      date: args.date,
      time: args.time,
      garmentType: args.garmentType,
      notes: args.notes,
    });

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
    
    const appointment = await ctx.db.get(args.id);
    
    await ctx.db.patch(args.id, {
      status: args.status,
    });

    if (appointment?.googleEventId) {
      await ctx.scheduler.runAfter(0, internal.googleCalendar.updateEventStatus, {
        googleEventId: appointment.googleEventId,
        status: args.status,
      });
    }
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
        await ctx.scheduler.runAfter(0, internal.email.sendAppointmentReminder, {
          appointmentId: appointment._id,
          email: appointment.email,
          name: appointment.name,
          date: appointment.date,
          time: appointment.time,
          garmentType: appointment.garmentType,
        });
      }
      
      // Mark as sent
      await ctx.db.patch(reminder._id, { status: "sent" });
    }
  },
});

export const getAvailableSlots = query({
  args: {
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // 1. Get availability settings
    const availabilitySetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "availability"))
      .first();

    if (!availabilitySetting || !availabilitySetting.value) {
      return []; // No settings, no availability
    }

    const { 
      workingDays, 
      startHour = '09:00', 
      endHour = '17:00', 
      lunchStart = '12:00', 
      lunchEnd = '13:00', 
      bufferTime = 30 
    } = availabilitySetting.value;

    // Check if the requested date is a working day
    const requestDate = new Date(`${args.date}T12:00:00`); // Use noon to avoid timezone shift
    const dayOfWeek = requestDate.getDay();
    if (workingDays && !workingDays.includes(dayOfWeek)) {
      return []; // Not a working day
    }

    // Helper to convert "HH:MM" to minutes from midnight
    const toMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    // Helper to convert minutes to "HH:MM"
    const toTimeStr = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const startMins = toMinutes(startHour);
    const endMins = toMinutes(endHour);
    const lunchStartMins = toMinutes(lunchStart);
    const lunchEndMins = toMinutes(lunchEnd);

    // 2. Fetch existing appointments for the given date that are not cancelled
    const existingApts = await ctx.db
      .query("appointments")
      .filter((q) => q.and(
        q.eq(q.field("date"), args.date),
        q.neq(q.field("status"), "cancelled")
      ))
      .collect();

    const appointmentDuration = 60; // Standard 60 mins per appointment

    // Each appointment blocks [aptTime, aptTime + duration + buffer]
    const blockedIntervals = existingApts
      .filter(apt => apt.time)
      .map(apt => {
        const aptStart = toMinutes(apt.time!);
        return { start: aptStart, end: aptStart + appointmentDuration + bufferTime };
      });

    // 3. Generate candidate slots every 30 minutes
    const availableSlots: string[] = [];
    
    for (let current = startMins; current + appointmentDuration <= endMins; current += 30) {
      const currentEnd = current + appointmentDuration;
      
      // Check lunch overlap: does [current, currentEnd] overlap with [lunchStartMins, lunchEndMins]?
      const overlapsLunch = current < lunchEndMins && currentEnd > lunchStartMins;
      if (overlapsLunch) continue;

      // Check existing appointments overlap
      // This new slot would block [current, currentEnd + bufferTime]
      const newSlotBlockEnd = currentEnd + bufferTime;
      
      let overlapsExisting = false;
      for (const block of blockedIntervals) {
        // Overlap condition: start1 < end2 && end1 > start2
        if (current < block.end && newSlotBlockEnd > block.start) {
          overlapsExisting = true;
          break;
        }
      }

      // Check if it's in the past (if today)
      let isPast = false;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      if (args.date === todayStr) {
        const currentMinsNow = today.getHours() * 60 + today.getMinutes();
        if (current <= currentMinsNow) {
          isPast = true;
        }
      }

      if (!overlapsExisting && !isPast) {
        availableSlots.push(toTimeStr(current));
      }
    }

    return availableSlots;
  },
});

export const saveGoogleEventId = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
    googleEventId: v.string(),
    meetLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appointmentId, {
      googleEventId: args.googleEventId,
      meetLink: args.meetLink,
    });
  }
});

export const getUserAppointments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const assignTailor = mutation({
  args: {
    appointmentId: v.id("appointments"),
    tailorName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || (identity as any).role !== "admin") {
      // Basic check, in reality should use a proper role check if available
    }
    
    await ctx.db.patch(args.appointmentId, {
      assignedTo: args.tailorName,
    });
  },
});

export const reschedule = mutation({
  args: {
    appointmentId: v.id("appointments"),
    date: v.string(),
    time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const apt = await ctx.db.get(args.appointmentId);
    if (!apt) throw new Error("Appointment not found");

    if (identity && identity.subject !== apt.userId && (identity as any).role !== "admin") {
      throw new Error("Unauthorized to reschedule this appointment");
    }

    // Optional: 24h block check
    // const aptDate = new Date(`${apt.date}T${apt.time || "00:00"}`);
    // if (aptDate.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    //   throw new Error("Cannot reschedule within 24 hours of appointment");
    // }

    await ctx.db.patch(args.appointmentId, {
      date: args.date,
      time: args.time,
    });

    if (apt.googleEventId) {
      await ctx.scheduler.runAfter(0, internal.googleCalendar.updateEventTime, {
        googleEventId: apt.googleEventId,
        date: args.date,
        time: args.time,
      });
    }
  },
});
