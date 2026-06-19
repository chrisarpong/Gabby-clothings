import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/getFile",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId") as Id<"_storage">;
    
    if (!storageId) {
      return new Response("Missing storageId parameter", { status: 400 });
    }

    // 1. Determine if the file is private
    const ownership = await ctx.runQuery(internal.appointments.getFileOwner, { storageId });
    if (ownership.isPrivate) {
      // 2. Enforce authentication for private files
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response("Unauthorized: Authentication required", { status: 401 });
      }

      // 3. Enforce ownership or admin
      if (identity.subject !== ownership.ownerId) {
        const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
        if (user?.role !== "admin") {
          return new Response("Forbidden: You do not have permission to view this file", { status: 403 });
        }
      }
    }

    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", { status: 404 });
    }
    
    return new Response(blob);
  }),
});

// ─── Paystack Webhook ────────────────────────────────────────────────
// This endpoint receives POST requests from Paystack when a payment
// succeeds (especially critical for Mobile Money / USSD where the
// user's browser may lose connectivity before the redirect completes).
http.route({
  path: "/webhooks/paystack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Read raw body and signature header
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    // 2. Verify HMAC-SHA512 signature using PAYSTACK_SECRET_KEY
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY not configured for webhook verification.");
      return new Response("Server configuration error", { status: 500 });
    }

    // Use Web Crypto API (available in Convex runtime) for HMAC-SHA512
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(paystackSecret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedHash !== signature) {
      console.error("Paystack webhook signature mismatch. Rejecting.");
      return new Response("Invalid signature", { status: 401 });
    }

    // 3. Parse the verified payload
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // 4. Handle charge.success events
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference as string;
      const amountInCurrency = (data.amount as number) / 100; // pesewas → GH₵

      // Dispatch to an internal mutation that idempotently reconciles the payment
      await ctx.runMutation(internal.webhooks.reconcilePaystackPayment, {
        paystackReference: reference,
        amountPaid: amountInCurrency,
        customerEmail: data.customer?.email || "",
        paidAt: data.paid_at || new Date().toISOString(),
      });
    }

    // 5. Return 200 immediately so Paystack doesn't retry
    return new Response("OK", { status: 200 });
  }),
});

export default http;
