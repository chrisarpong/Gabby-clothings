import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { verifyPaystackWebhookSignature } from "./lib/paystack";

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
      // Check for staffToken first
      const staffToken = searchParams.get("staffToken");
      let isStaffAuthorized = false;
      
      if (staffToken) {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(staffToken));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const staff = await ctx.runQuery(internal.staffAuth.validateSession, { tokenHash });
        if (staff) {
          isStaffAuthorized = true;
        }
      }

      if (!isStaffAuthorized) {
        // 2. Enforce Clerk authentication for private files
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
          return new Response("Unauthorized: Authentication required", { status: 401 });
        }

        // 3. Enforce ownership (Clerk user must own it, we no longer rely on Clerk 'admin' role here, 
        // since admins should use staffToken)
        if (identity.subject !== ownership.ownerId) {
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

    if (!(await verifyPaystackWebhookSignature(rawBody, signature, paystackSecret))) {
      return new Response("Invalid signature", { status: 401 });
    }

    // 3. Parse the verified payload
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (event.event !== "charge.success" || !event.data || typeof event.data.reference !== "string") {
      return new Response("Unsupported event", { status: 400 });
    }
    const data = event.data;
    if (!Number.isSafeInteger(data.amount) || data.amount < 0 || typeof data.currency !== "string") {
      return new Response("Invalid payment payload", { status: 400 });
    }
    try {
      await ctx.runMutation(internal.webhooks.reconcilePaystackPayment, {
        reference: data.reference,
        amountPesewas: data.amount,
        currency: data.currency,
        paidAt: typeof data.paid_at === "string" ? data.paid_at : new Date().toISOString(),
      });
    } catch (error) {
      console.error("Paystack reconciliation failed", error);
      return new Response("Retryable reconciliation failure", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  }),
});

http.route({
  path: "/client-info",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Convex automatically forwards real IPs in standard headers from its load balancers
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "Unknown IP";
               
    // Allow CORS so the frontend can call it directly without issues
    return new Response(JSON.stringify({ ipAddress: ip }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});
http.route({
  path: "/client-info",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});
export default http;
