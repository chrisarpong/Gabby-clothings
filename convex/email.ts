import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";

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

export const sendOrderStatusUpdate = internalAction({
  args: {
    orderId: v.id("orders"),
    email: v.string(),
    name: v.string(),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log(`[Email Mock] Would send order ${args.status} update to ${args.email} for order ${args.orderId}`);
      return;
    }

    const resend = new Resend(resendApiKey);
    
    let message = "";
    let subject = "";

    switch (args.status.toLowerCase()) {
      case "processing":
        subject = "Your Order is Being Processed - Gabby Atelier";
        message = "We have received your payment and our master tailors have begun processing your order. You will receive another update when it has shipped.";
        break;
      case "shipped":
        subject = "Your Order Has Shipped - Gabby Atelier";
        message = `Good news! Your order has been dispatched. ${args.trackingNumber ? "Tracking Number: " + args.trackingNumber : ""}`;
        break;
      case "delivered":
        subject = "Your Order Has Been Delivered - Gabby Atelier";
        message = "Your order has been marked as delivered. We hope you enjoy your bespoke garments.";
        break;
      case "cancelled":
        subject = "Order Cancelled - Gabby Atelier";
        message = "Your order has been cancelled. If this was a mistake, please reply to this email or contact support.";
        break;
      default:
        subject = "Order Update - Gabby Atelier";
        message = `Your order status has been updated to: ${args.status}`;
        break;
    }

    try {
      await resend.emails.send({
        from: "Gabby Atelier <orders@gabbyatelier.com>",
        to: args.email,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #4a3c31; font-style: italic;">Order Update</h1>
            <p>Dear ${args.name},</p>
            <p>${message}</p>
            <div style="background-color: #f9f8f6; padding: 20px; border-left: 4px solid #4a3c31; margin: 20px 0;">
              <p style="margin: 0; font-family: monospace;"><strong>Order ID:</strong> ${args.orderId}</p>
              <p style="margin: 5px 0 0 0; text-transform: capitalize;"><strong>Status:</strong> ${args.status}</p>
            </div>
            <p>Thank you for choosing Gabby Atelier,</p>
            <p><strong>The Gabby Atelier Team</strong></p>
          </div>
        `,
      });
      console.log(`Successfully sent order update to ${args.email}`);
    } catch (error) {
      console.error("Failed to send order email via Resend:", error);
    }
  },
});

export const sendOrderConfirmation = internalAction({
  args: {
    orderId: v.id("orders"),
    email: v.string(),
    name: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return;

    const resend = new Resend(resendApiKey);

    try {
      await resend.emails.send({
        from: "Gabby Atelier <orders@gabbynewluk.com>",
        to: args.email,
        subject: "Thank you for your Order - Gabby Newluk",
        html: `
<div style="font-family: 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; background-color: #ffffff; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #4a3c31; font-style: italic; font-family: Georgia, serif; font-size: 28px; margin: 0;">Gabby Newluk</h1>
    <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #888; margin-top: 5px;">Bespoke Tailoring</p>
  </div>
  
  <h2 style="font-size: 20px; font-weight: normal;">Thank you for your order, ${args.name}!</h2>
  <p style="line-height: 1.6; color: #555;">We have received your order and payment. Our master tailors will begin reviewing your measurements and preparing your fabrics shortly.</p>
  
  <div style="background-color: #f9f8f6; padding: 25px; border-left: 3px solid #4a3c31; margin: 30px 0;">
    <p style="margin: 0 0 10px 0; font-family: monospace; color: #666;"><strong>Order ID:</strong> ${args.orderId}</p>
    <p style="margin: 0; font-family: monospace; color: #666;"><strong>Amount Paid:</strong> GH₵${args.amount.toFixed(2)}</p>
  </div>

  <p style="line-height: 1.6; color: #555;">We will send you another email as soon as your garments have shipped. If you requested custom measurements, we may reach out to you to confirm details.</p>
  
  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
    <p>Gabby Newluk | Premium Bespoke Fashion</p>
    <p>contact@gabbynewluk.com</p>
  </div>
</div>
        `,
      });
    } catch (error) {
      console.error("Failed to send order confirmation:", error);
    }
  },
});

export const sendAppointmentUpdate = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    status: v.string(), // 'confirmed', 'rescheduled', 'cancelled'
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log(`[Email Mock] Would send appointment ${args.status} update to ${args.email}`);
      return;
    }

    const resend = new Resend(resendApiKey);

    let subject = "Appointment Update - Gabby Newluk";
    let message = "";

    if (args.status === 'confirmed') {
      subject = "Appointment Confirmed - Gabby Newluk";
      message = `Hello ${args.name}, your bespoke tailoring appointment has been successfully booked and confirmed.`;
    } else if (args.status === 'rescheduled') {
      subject = "Appointment Rescheduled - Gabby Newluk";
      message = `Hello ${args.name}, your bespoke tailoring appointment has been rescheduled.`;
    } else if (args.status === 'cancelled') {
      subject = "Appointment Cancelled - Gabby Newluk";
      message = `Hello ${args.name}, your bespoke tailoring appointment has been cancelled. If this was a mistake, please reach out to us.`;
    }

    try {
      await resend.emails.send({
        from: "Gabby Atelier <appointments@gabbynewluk.com>",
        to: args.email,
        subject,
        html: `
<div style="font-family: 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; background-color: #ffffff; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #4a3c31; font-style: italic; font-family: Georgia, serif; font-size: 28px; margin: 0;">Gabby Newluk</h1>
  </div>
  
  <h2 style="font-size: 20px; font-weight: normal; text-transform: capitalize;">Appointment ${args.status}</h2>
  <p style="line-height: 1.6; color: #555;">${message}</p>
  
  ${args.status !== 'cancelled' ? `
  <div style="background-color: #f9f8f6; padding: 25px; border-left: 3px solid #4a3c31; margin: 30px 0;">
    <p style="margin: 0 0 10px 0; color: #666;"><strong>Date:</strong> ${args.date}</p>
    ${args.time ? `<p style="margin: 0 0 10px 0; color: #666;"><strong>Time:</strong> ${args.time}</p>` : ''}
    <p style="margin: 0; color: #666;"><strong>Location:</strong> Our Atelier / Virtual</p>
  </div>
  ` : ''}

  <p style="line-height: 1.6; color: #555;">If you have any questions, please contact us.</p>
</div>
        `,
      });
      console.log(`Successfully sent appointment ${args.status} update to ${args.email}`);
    } catch (error) {
      console.error(`Failed to send appointment ${args.status} update:`, error);
    }
  },
});

export const sendPromoBroadcast = action({
  args: {
    promoCode: v.string(),
    discountValue: v.number(),
  },
  handler: async (ctx, args) => {
    // Admin-only guard: actions don't have ctx.db, so verify identity
    // and rely on getAllEmails (which itself enforces admin via checkAdmin).
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated: You must be signed in.");

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new Error("Resend API key not configured");

    // This call will throw "Unauthorized: Admin access required" if the
    // caller is not an admin, because getAllEmails enforces checkAdmin.
    const users = await ctx.runQuery(api.users.getAllEmails);
    const resend = new Resend(resendApiKey);

    let sentCount = 0;
    
    // Using Resend's batch send or loop. Looping to avoid batch limits for now.
    for (const user of users) {
      try {
        await resend.emails.send({
          from: "Gabby Atelier <promotions@gabbynewluk.com>",
          to: user.email,
          subject: "Exclusive Offer: Elevate Your Wardrobe with Gabby Newluk",
          html: `
<div style="font-family: 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; background-color: #ffffff; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #4a3c31; font-style: italic; font-family: Georgia, serif; font-size: 28px; margin: 0;">Gabby Newluk</h1>
    <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #888; margin-top: 5px;">Bespoke Tailoring</p>
  </div>
  
  <div style="text-align: center; background-color: #4a3c31; color: #ffffff; padding: 40px 20px; margin-bottom: 30px;">
    <h2 style="font-size: 24px; font-weight: normal; margin: 0 0 10px 0; font-family: Georgia, serif; font-style: italic;">The Private Sale</h2>
    <p style="margin: 0; font-size: 16px; letter-spacing: 1px;">Enjoy ${args.discountValue}% off all bespoke collections.</p>
  </div>

  <p style="line-height: 1.6; color: #555; text-align: center; font-size: 15px;">
    Dear ${user.name}, we are delighted to invite you to our private seasonal event. Elevate your wardrobe with our masterfully crafted agbadas, kaftans, and suits.
  </p>
  
  <div style="text-align: center; margin: 40px 0;">
    <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 10px;">Use Code At Checkout</p>
    <div style="display: inline-block; border: 2px dashed #4a3c31; padding: 15px 30px; font-size: 22px; font-family: monospace; font-weight: bold; color: #4a3c31; background-color: #f9f8f6;">
      ${args.promoCode}
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px;">
    <a href="https://gabbynewluk.com" style="display: inline-block; background-color: #4a3c31; color: #ffffff; text-decoration: none; padding: 15px 35px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Shop The Collection</a>
  </div>
  
  <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; line-height: 1.5;">
    <p>Gabby Newluk | Premium Bespoke Fashion</p>
  </div>
</div>
          `,
        });
        sentCount++;
      } catch (err) {
        console.error("Failed to send promo to", user.email, err);
      }
    }
    return `Broadcast sent to ${sentCount} users.`;
  }
});
