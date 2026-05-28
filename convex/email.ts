import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendAppointmentReminder = internalAction({
  args: {
    appointmentId: v.id("appointments"),
    email: v.string(),
    name: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    garmentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log(`[Email Mock] Would send reminder to ${args.email} for appointment on ${args.date} at ${args.time || 'TBD'}`);
      return;
    }

    const resend = new Resend(resendApiKey);

    try {
      await resend.emails.send({
        from: "Gabby Atelier <appointments@gabbyatelier.com>",
        to: args.email,
        subject: "Reminder: Your Upcoming Fitting with Gabby Atelier",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #4a3c31; font-style: italic;">Upcoming Appointment</h1>
            <p>Dear ${args.name},</p>
            <p>This is a gentle reminder of your upcoming ${args.garmentType || 'fitting'} appointment with Gabby Atelier.</p>
            <div style="background-color: #f9f8f6; padding: 20px; border-left: 4px solid #4a3c31; margin: 20px 0;">
              <p style="margin: 0;"><strong>Date:</strong> ${args.date}</p>
              ${args.time ? `<p style="margin: 5px 0 0 0;"><strong>Time:</strong> ${args.time}</p>` : ''}
            </div>
            <p>If you need to reschedule or cancel, you can do so directly from your Profile on our website.</p>
            <p>We look forward to seeing you,</p>
            <p><strong>The Gabby Atelier Team</strong></p>
          </div>
        `,
      });
      console.log(`Successfully sent reminder to ${args.email}`);
    } catch (error) {
      console.error("Failed to send email reminder via Resend:", error);
    }
  },
});
