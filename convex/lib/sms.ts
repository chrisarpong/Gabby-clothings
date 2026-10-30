import { toBmsLocal } from "./phone";
import { internal } from "../_generated/api";

export const LOW_CREDIT_THRESHOLD = 50;

export interface SendSmsArgs {
  to: string;
  message: string;
  kind: "otp" | "notice";
}

export interface SendSmsResult {
  ok: boolean;
  providerMessageId?: string;
  creditLeft?: number;
  error?: string;
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

export async function sendSms(args: SendSmsArgs, ctx?: any): Promise<SendSmsResult> {
  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase();

  if (provider === "mock") {
    mockSentMessages.push({
      to: args.to,
      message: args.message,
      kind: args.kind,
      timestamp: Date.now(),
    });

    if (process.env.ALLOW_DEV_SMS_OUTBOX === "true" && ctx?.runMutation) {
      try {
        await ctx.runMutation(internal.smsDev.recordDevMessage, {
          phone: args.to,
          message: args.message,
          kind: args.kind,
        });
      } catch {
        // Dev outbox write failure must never break delivery
      }
    }

    return {
      ok: true,
      providerMessageId: `mock-${Date.now()}`,
      creditLeft: 100,
    };
  }

  if (provider === "bms") {
    const apiKey = process.env.BMS_SMS_API_KEY;
    const senderId = process.env.BMS_SMS_SENDER_ID;

    if (!apiKey || !senderId || senderId.length > 11 || !/^[a-zA-Z0-9]{1,11}$/.test(senderId)) {
      console.error("SMS not configured");
      return { ok: false, error: "SMS not configured" };
    }

    let recipientLocal: string;
    try {
      recipientLocal = toBmsLocal(args.to);
    } catch {
      return { ok: false, error: "Invalid recipient phone number" };
    }

    const payload: Record<string, any> = {
      recipient: [recipientLocal],
      sender: senderId,
      message: args.message,
      is_schedule: false,
      schedule_date: "",
    };

    if (args.kind === "otp") {
      payload.sms_type = "otp";
    }

    const url = `https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey)}`;

    const executeFetch = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        return await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    let response: Response;
    try {
      response = await executeFetch();
    } catch (firstErr: any) {
      console.error("BMS network error", firstErr instanceof Error ? firstErr.name : "UnknownError");
      // Retry once only on network error
      try {
        response = await executeFetch();
      } catch (retryErr: any) {
        console.error("BMS network error", retryErr instanceof Error ? retryErr.name : "UnknownError");
        return { ok: false, error: "SMS network error" };
      }
    }

    if (!response.ok) {
      return { ok: false, error: "SMS delivery failed" };
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      return { ok: false, error: "Invalid SMS response" };
    }

    const isSuccess =
      data &&
      data.status === "success" &&
      String(data.code) === "2000" &&
      data.summary &&
      typeof data.summary.total_sent === "number" &&
      data.summary.total_sent >= 1 &&
      data.summary.total_rejected === 0;

    if (!isSuccess) {
      return { ok: false, error: "SMS delivery rejected" };
    }

    const creditLeft = typeof data.summary.credit_left === "number" ? data.summary.credit_left : undefined;

    if (creditLeft !== undefined && creditLeft < LOW_CREDIT_THRESHOLD && ctx?.runMutation) {
      try {
        await ctx.runMutation(internal.smsAdmin.recordLowCreditAlert, { creditLeft });
      } catch {
        // Low credit notification must never cause send to fail
      }
    }

    return {
      ok: true,
      providerMessageId: data.summary._id ? String(data.summary._id) : undefined,
      creditLeft,
    };
  }

  return { ok: false, error: "Unknown SMS provider" };
}

