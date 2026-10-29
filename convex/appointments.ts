import { checkRateLimit } from "./authHelper";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { requireStaff } from "./staffAuth";
import { constantTimeEqual, generatePaymentReference, verifyPaystackTransaction } from "./lib/paystack";

export const book = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    garmentType: v.string(),
    notes: v.optional(v.string()),
    referenceImages: v.optional(v.array(v.id("_storage"))),
    occasionType: v.optional(v.string()),
    targetEventDate: v.optional(v.string()),
    ghanaPostGps: v.optional(v.string()),
    landmarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, "bookAppointment", 5, 60000, args.email); // 5 per minute per identity/email

    // Optionally link to identity if available
    const identity = await ctx.auth.getUserIdentity();
    
    // Check Availability Settings
    const availabilitySetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "availability"))
      .first();

    if (availabilitySetting && availabilitySetting.value && args.time) {
      const { workingDays, startHour, endHour } = availabilitySetting.value;
      const appointmentDate = new Date(`${args.date}T12:00:00`);
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

    if (args.time) {
      const toMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const appointmentDuration = 60;
      const bufferTime = availabilitySetting?.value?.bufferTime || 30;
      const newSlotStart = toMinutes(args.time);
      const newSlotEnd = newSlotStart + appointmentDuration + bufferTime;

      const existingApts = await ctx.db
        .query("appointments")
        .withIndex("by_date", (q) => q.eq("date", args.date))
        .filter((q) => q.and(q.neq(q.field("status"), "cancelled"), q.neq(q.field("status"), "expired"), q.or(q.neq(q.field("paymentStatus"), "awaiting_payment"), q.gt(q.field("paymentExpiresAt"), Date.now()))))
        .collect();

      for (const apt of existingApts) {
        if (apt.time === args.time) {
          throw new Error("This time slot has just been booked by someone else. Please select another time.");
        }
        if (!apt.time) continue;
        const aptStart = toMinutes(apt.time);
        const aptEnd = aptStart + appointmentDuration + bufferTime;
        if (newSlotStart < aptEnd && newSlotEnd > aptStart) {
          throw new Error("This time slot is no longer available.");
        }
      }
    }
    
    const depositSetting = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "bookingDepositAmount")).first();
    const expectedDeposit = Number(depositSetting?.value ?? 0);
    if (!Number.isFinite(expectedDeposit) || expectedDeposit < 0) throw new Error("Configured booking deposit is invalid.");
    const expectedAmountPesewas = Math.round(expectedDeposit * 100);
    const paymentReference = expectedAmountPesewas > 0 ? generatePaymentReference() : undefined;
    const appointmentId = await ctx.db.insert("appointments", {
      ...args,
      userId: identity ? identity.subject : undefined,
      status: "pending",
      paymentStatus: expectedAmountPesewas > 0 ? "awaiting_payment" : "not_required",
      expectedAmountPesewas,
      paymentExpiresAt: expectedAmountPesewas > 0 ? Date.now() + 30 * 60 * 1000 : undefined,
      paystackReference: paymentReference,
      referenceImages: args.referenceImages,
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

    return { appointmentId, paymentReference };
  },
});

export const finalizeAppointmentPayment = internalMutation({
  args: { appointmentId: v.id("appointments"), reference: v.string(), amountPesewas: v.number(), currency: v.string() },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new ConvexError("Appointment not found.");
    if (appointment.paymentStatus === "paid") return appointment._id;
    const expectedAmountPesewas = appointment.expectedAmountPesewas ?? 0;
    if (args.currency !== "GHS") {
      await ctx.db.insert("paymentIssues", { reference: args.reference, kind: "wrong_currency", details: `Expected GHS but verified ${args.currency}.`, amountPesewas: args.amountPesewas, relatedId: appointment._id, resolved: false, createdAt: Date.now() });
      return null;
    }
    if (args.amountPesewas !== expectedAmountPesewas) {
      await ctx.db.insert("paymentIssues", { reference: args.reference, kind: "amount_mismatch", details: `Expected ${expectedAmountPesewas} pesewas but received ${args.amountPesewas}.`, amountPesewas: args.amountPesewas, relatedId: appointment._id, resolved: false, createdAt: Date.now() });
      return null;
    }
    await ctx.db.patch(appointment._id, { paymentStatus: "paid", status: "confirmed", paystackReference: args.reference, amountPaid: args.amountPesewas / 100 });
    if (appointment.time) await ctx.scheduler.runAfter(0, internal.email.sendAppointmentReminder, { appointmentId: appointment._id, email: appointment.email, name: appointment.name, date: appointment.date, time: appointment.time, garmentType: appointment.garmentType });
    await ctx.scheduler.runAfter(0, internal.email.sendAppointmentUpdate, { email: appointment.email, name: appointment.name, date: appointment.date, time: appointment.time, status: "confirmed" });
    return appointment._id;
  },
});

export const verifyAppointmentPayment = action({
  args: { appointmentId: v.id("appointments"), reference: v.string() },
  handler: async (ctx, args): Promise<{ status: string; appointmentId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    const appointment: any = await ctx.runQuery(internal.appointments.getByIdInternal, { appointmentId: args.appointmentId });
    if (!appointment) throw new ConvexError({ code: "NOT_FOUND", message: "Appointment not found." });
    if (identity) {
      if (appointment.userId !== identity.subject) throw new ConvexError({ code: "FORBIDDEN", message: "Appointment not found." });
    } else if (!appointment.paystackReference || !constantTimeEqual(appointment.paystackReference, args.reference)) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Appointment not found." });
    }
    if (appointment.paymentStatus === "paid") return { status: "success", appointmentId: appointment._id };
    if (!appointment.paystackReference || !constantTimeEqual(appointment.paystackReference, args.reference)) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Invalid payment reference." });
    }
    const verified = await verifyPaystackTransaction(args.reference);
    if (!verified.ok || verified.reference !== args.reference) throw new ConvexError("Deposit payment is not confirmed. Do not pay again.");
    const result = await ctx.runMutation(internal.appointments.finalizeAppointmentPayment, {
      appointmentId: args.appointmentId,
      reference: args.reference,
      amountPesewas: verified.amountPesewas,
      currency: verified.currency,
    });
    if (!result) throw new ConvexError("Deposit payment requires review. Do not pay again.");
    return { status: "success", appointmentId: result };
  },
});

export const getByIdInternal = internalQuery({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => await ctx.db.get(args.appointmentId),
});

export const expireAwaitingPayments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const rows = await ctx.db.query("appointments").withIndex("by_paymentStatus_expiry", q => q.eq("paymentStatus", "awaiting_payment")).collect();
    let expired = 0;
    for (const appointment of rows) {
      if (appointment.paymentExpiresAt && appointment.paymentExpiresAt < now) {
        await ctx.db.patch(appointment._id, { paymentStatus: "expired", status: "expired", cancelReason: "payment_timeout" });
        expired++;
      }
    }
    return expired;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated: You must be signed in to upload files.");
  return await ctx.storage.generateUploadUrl();
});

export const getUpcoming = query({
  args: {
      staffToken: v.string()
},
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "appointments" });
    return await ctx.db.query("appointments").collect();
  },
});

export const updateStatus = mutation({
  args: {
      staffToken: v.string(),
    id: v.id("appointments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "appointments" });
    const appointment = await ctx.db.get(args.id);
    if (!appointment) throw new Error("Appointment not found");
    
    await ctx.db.patch(args.id, {
      status: args.status,
    });

    if (appointment?.googleEventId) {
      await ctx.scheduler.runAfter(0, internal.googleCalendar.updateEventStatus, {
        googleEventId: appointment.googleEventId,
        status: args.status,
      });
    }

    // Trigger email notification hook
    await ctx.scheduler.runAfter(0, internal.email.sendAppointmentUpdate, {
      email: appointment.email,
      name: appointment.name,
      date: appointment.date,
      time: appointment.time,
      status: args.status,
    });
  },
});

export const cancelOwnAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.userId !== identity.subject) {
      throw new Error("Unauthorized: You do not own this appointment");
    }

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      throw new Error("Appointment cannot be cancelled in its current state");
    }

    await ctx.db.patch(args.appointmentId, { status: "cancelled" });
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
      if (appointment && appointment.status !== 'cancelled' && appointment.status !== 'expired') {
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

export const getFileOwner = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const appointments = await ctx.db.query("appointments").collect();
    for (const appt of appointments) {
      if (appt.referenceImages && appt.referenceImages.includes(args.storageId)) {
        return { isPrivate: true, ownerId: appt.userId };
      }
    }
    return { isPrivate: false };
  }
});

export const getAvailableSlots = query({
  args: {
    date: v.string(), // YYYY-MM-DD
    ignoreAppointmentId: v.optional(v.id("appointments")),
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

    const safeBufferTime = bufferTime > 0 ? bufferTime : 30;

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
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.and(q.neq(q.field("status"), "cancelled"), q.neq(q.field("status"), "expired"), q.or(q.neq(q.field("paymentStatus"), "awaiting_payment"), q.gt(q.field("paymentExpiresAt"), Date.now()))))
      .collect();

    const appointmentDuration = 60; // Standard 60 mins per appointment

    // Each appointment blocks [aptTime, aptTime + duration + buffer]
    const blockedIntervals = existingApts
      .filter(apt => apt.time && apt._id !== args.ignoreAppointmentId)
      .map(apt => {
        const aptStart = toMinutes(apt.time!);
        return { start: aptStart, end: aptStart + appointmentDuration + safeBufferTime };
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
        // Use getUTCHours since Ghana time is UTC+0
        const currentMinsNow = today.getUTCHours() * 60 + today.getUTCMinutes();
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
  args: {
    userId: v.string() 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }
    // Only the owner or an admin can view appointments
    return await ctx.db
      .query("appointments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const assignTailor = mutation({
  args: {
      staffToken: v.string(),
    appointmentId: v.id("appointments"),
    assignedStaffId: v.union(v.id("staff"), v.null()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "appointments" });
    const designer = args.assignedStaffId ? await ctx.db.get(args.assignedStaffId) : null;
    if (args.assignedStaffId && (!designer || designer.role !== "designer" || !designer.isActive)) {
      throw new Error("Assigned staff member must be an active designer.");
    }
    await ctx.db.patch(args.appointmentId, {
      assignedStaffId: args.assignedStaffId ?? undefined,
      assignedTo: designer?.name,
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
    if (!identity) throw new Error("Unauthenticated");
    const apt = await ctx.db.get(args.appointmentId);
    if (!apt) throw new Error("Appointment not found");
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

    // Send rescheduling email
    await ctx.scheduler.runAfter(0, internal.email.sendAppointmentUpdate, {
      email: apt.email,
      name: apt.name,
      date: args.date,
      time: args.time,
      status: "rescheduled",
    });
  },
});

export const updateDetails = mutation({
  args: {
      staffToken: v.string(),
    appointmentId: v.id("appointments"),
    appointmentType: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    fabricAndStyling: v.optional(v.any()),
    adminNotes: v.optional(v.string()),
    depositAmount: v.optional(v.number()),
    paystackReference: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    measurementsCaptured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "appointments" });
    const { appointmentId, ...updates } = args;
    await ctx.db.patch(appointmentId, updates);
  }
});

export const recordDeposit = mutation({
  args: {
      staffToken: v.string(),
    appointmentId: v.id("appointments"),
    amountPaid: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "appointments" });
    const apt = await ctx.db.get(args.appointmentId);
    if (!apt) throw new Error("Appointment not found");

    await ctx.db.patch(args.appointmentId, {
      amountPaid: (apt.amountPaid || 0) + args.amountPaid,
      paymentStatus: "paid", // For appointments, the deposit usually means paid
      paystackReference: args.paystackReference,
    });
  }
});

/* Removed unauthenticated appointment payment confirmation in Phase 3 F.
const confirmCustomerPayment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    // Called by the public storefront after Paystack success
    await ctx.db.patch(args.appointmentId, {
      paymentStatus: "paid",
      paystackReference: args.paystackReference,
    });
  }
});

*/
export const linkToUser = mutation({
  args: {
      staffToken: v.string(),
    appointmentId: v.id("appointments"),
    userId: v.string(), // This is the clerkId / user ID
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "appointments" });
    await ctx.db.patch(args.appointmentId, {
      userId: args.userId,
    });
  }
});
