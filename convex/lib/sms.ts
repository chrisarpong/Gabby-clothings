import { toBmsLocal } from "./phone";
import { internal } from "../_generated/api";

export const LOW_CREDIT_THRESHOLD = 50;

export type SmsFailureCode = "not_configured" | "timeout" | "network" | "http_error" | "provider_rejected" | "bad_response";

export interface SendSmsArgs {
  to: string;
  message: string;
  kind: "otp" | "notice";
}

export interface SendSmsResult {
  ok: boolean;
  errorCode?: SmsFailureCode;
  providerStatus?: number;
  providerMessage?: string;
  providerMessageId?: string;
  creditLeft?: number;
}

export interface MockSmsMessage {
  to: string;
  message: string;
  kind: "otp" | "notice";
  timestamp: number;
}

let mockSentMessages: MockSmsMessage[] = [];

export function getMockSentMessages(): MockSmsMessage[] {
  return [...mockSentMessages];
}

export function clearMockSentMessages(): void {
  mockSentMessages = [];
}

function sanitizeProviderMessage(value: unknown, sentMessage: string, recipient: string): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  let safe = value.trim();
  if (sentMessage) safe = safe.split(sentMessage).join("[message omitted]");
  if (recipient) safe = safe.split(recipient).join("[phone omitted]");
  safe = safe
    .replace(/https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+/gi, "[URL omitted]")
    .replace(/\b(api[_ -]?key|key|token|secret|authorization)\b\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[redacted]");
  return safe.slice(0, 120);
}

async function recordProviderFailure(ctx: any, errorCode: SmsFailureCode): Promise<void> {
  if (!ctx?.runMutation) return;
  try {
    await ctx.runMutation(internal.smsAdmin.recordProviderFailure, { failureCode: errorCode });
  } catch {
    // Delivery failure must not be hidden by a notification write failure.
  }
}

async function fail(
  ctx: any,
  errorCode: SmsFailureCode,
  details: { providerStatus?: number; providerMessage?: string } = {},
): Promise<SendSmsResult> {
  await recordProviderFailure(ctx, errorCode);
  return { ok: false, errorCode, ...details };
}

export async function sendSms(args: SendSmsArgs, ctx?: any): Promise<SendSmsResult> {
  const provider = process.env.SMS_PROVIDER;
  if (provider === "mock") {
    mockSentMessages.push({ to: args.to, message: args.message, kind: args.kind, timestamp: Date.now() });
    if (process.env.ALLOW_DEV_SMS_OUTBOX === "true" && ctx?.runMutation) {
      try {
        await ctx.runMutation(internal.smsDev.recordDevMessage, {
          phone: args.to,
          message: args.message,
          kind: args.kind,
        });
      } catch {
        // A local outbox write must not break mock delivery.
      }
    }
    return { ok: true, providerMessageId: `mock-${Date.now()}`, creditLeft: 100 };
  }

  if (provider !== "bms") return await fail(ctx, "not_configured");

  const apiKey = process.env.BMS_SMS_API_KEY;
  const senderId = process.env.BMS_SMS_SENDER_ID;
  if (!apiKey || !senderId || !/^[a-zA-Z0-9]{1,11}$/.test(senderId)) {
    return await fail(ctx, "not_configured");
  }

  let recipientLocal: string;
  try {
    recipientLocal = toBmsLocal(args.to);
  } catch {
    return await fail(ctx, "provider_rejected");
  }

  const payload: Record<string, unknown> = {
    recipient: [recipientLocal],
    sender: senderId,
    message: args.message,
    is_schedule: false,
    schedule_date: "",
  };
  if (args.kind === "otp") payload.sms_type = "otp";

  const url = `https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey)}`;
  const executeFetch = async (): Promise<{ response?: Response; failure?: "network" | "timeout" }> => {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 10_000);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      return { response };
    } catch (error) {
      return { failure: timedOut || (error instanceof Error && error.name === "AbortError") ? "timeout" : "network" };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let fetchResult = await executeFetch();
  if (fetchResult.failure === "network") fetchResult = await executeFetch();
  if (fetchResult.failure) return await fail(ctx, fetchResult.failure);

  const response = fetchResult.response!;
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return await fail(ctx, response.ok ? "bad_response" : "http_error", { providerStatus: response.status });
  }
  const record = data && typeof data === "object" ? data as Record<string, unknown> : undefined;
  const providerMessage = sanitizeProviderMessage(record?.message, args.message, args.to);

  if (!response.ok) {
    return await fail(ctx, "http_error", { providerStatus: response.status, providerMessage });
  }

  if (!record || typeof record.status !== "string" || record.code === undefined) {
    return await fail(ctx, "bad_response", { providerStatus: response.status, providerMessage });
  }

  if (record.status !== "success" || String(record.code) !== "2000") {
    return await fail(ctx, "provider_rejected", { providerStatus: response.status, providerMessage });
  }

  const summary = record.summary && typeof record.summary === "object"
    ? record.summary as Record<string, unknown>
    : undefined;
  if (!summary || typeof summary.total_sent !== "number" || typeof summary.total_rejected !== "number") {
    return await fail(ctx, "bad_response", { providerStatus: response.status, providerMessage });
  }
  if (summary.total_sent < 1 || summary.total_rejected !== 0) {
    return await fail(ctx, "provider_rejected", { providerStatus: response.status, providerMessage });
  }

  const creditLeft = typeof summary.credit_left === "number" ? summary.credit_left : undefined;
  if (creditLeft !== undefined && creditLeft < LOW_CREDIT_THRESHOLD && ctx?.runMutation) {
    try {
      await ctx.runMutation(internal.smsAdmin.recordLowCreditAlert, { creditLeft });
    } catch {
      // Low credit notification must never cause a send to fail.
    }
  }

  return {
    ok: true,
    providerStatus: response.status,
    providerMessage,
    providerMessageId: summary._id ? String(summary._id) : undefined,
    creditLeft,
  };
}
