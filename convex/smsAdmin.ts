import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const recordLowCreditAlert = internalMutation({
  args: { creditLeft: v.number() },
  handler: async (ctx, args) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const existing = await ctx.db.query("staffNotifications")
      .withIndex("by_type_createdAt", q => q.eq("type", "sms_low_credit").gt("createdAt", oneDayAgo))
      .first();
    if (!existing) {
      await ctx.db.insert("staffNotifications", {
        title: `SMS credits low (${args.creditLeft} left)`,
        type: "sms_low_credit",
        recipientRole: "ceo",
        createdAt: Date.now(),
        read: false,
      });
    }
  }
});

export const senderStatus = internalAction({
  args: {},
  handler: async () => {
    const apiKey = process.env.BMS_SMS_API_KEY;
    const senderId = process.env.BMS_SMS_SENDER_ID;
    if (!apiKey || !senderId) {
      return { status: "unconfigured", is_otp: false, otp_url: null };
    }
    try {
      const response = await fetch(`https://api.mnotify.com/api/senderid/status?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_name: senderId }),
      });
      if (!response.ok) {
        return { status: "error", is_otp: false, otp_url: null };
      }
      const data = await response.json();
      return {
        status: data.status ?? "unknown",
        is_otp: Boolean(data.is_otp),
        otp_url: data.otp_url ?? null,
      };
    } catch {
      console.error("BMS network error");
      return { status: "network_error", is_otp: false, otp_url: null };
    }
  }
});
