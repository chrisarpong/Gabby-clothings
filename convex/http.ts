import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/paystack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    const payload = await request.text();
    // @ts-ignore
    const secret = process.env.VITE_PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;
    
    if (!secret) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      return new Response("Server config error", { status: 500 });
    }

    // Verify HMAC SHA512 using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const hashBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (hashHex !== signature) {
      return new Response("Unauthorized signature", { status: 401 });
    }

    const body = JSON.parse(payload);
    if (body.event === "charge.success") {
      const reference = body.data.reference;
      await ctx.runMutation(api.orders.markOrderProcessing, { reference });
    }
    return new Response(null, { status: 200 });
  }),
});

export default http;
