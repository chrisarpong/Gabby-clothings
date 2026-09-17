import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendSms = internalAction({
  args: {
    phoneNumber: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ARKESEL_API_KEY;
    if (!apiKey) {
      console.warn("ARKESEL_API_KEY is not set. SMS not sent.", { to: args.phoneNumber, message: args.message });
      return;
    }

    try {
      // Arkesel v2 SMS API
      const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: "GabbyNewluk",
          message: args.message,
          recipients: [args.phoneNumber],
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Arkesel SMS failed:", data);
      } else {
        console.log("SMS sent successfully", data);
      }
    } catch (e) {
      console.error("Error sending SMS via Arkesel", e);
    }
  },
});
