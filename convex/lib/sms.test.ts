import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendSms, clearMockSentMessages, getMockSentMessages, LOW_CREDIT_THRESHOLD } from "./sms";
import { getTempPasswordSms, getPasswordChangedSms } from "./smsTemplates";

describe("SMS templates", () => {
  it("generates GSM-7 compliant template under 160 characters with 10-char password", () => {
    const siteUrl = "https://gabbynewluk.com";
    const tempSms = getTempPasswordSms("AbC3#kL9!x", siteUrl);
    expect(tempSms.length).toBeLessThanOrEqual(160);
    // ASCII-only check
    expect(/^[\x20-\x7E]+$/.test(tempSms)).toBe(true);
    expect(tempSms).toContain("AbC3#kL9!x");
    expect(tempSms).toContain("https://gabbynewluk.com/staff/login");

    const changedSms = getPasswordChangedSms();
    expect(changedSms.length).toBeLessThanOrEqual(160);
    expect(/^[\x20-\x7E]+$/.test(changedSms)).toBe(true);
  });
});

describe("SMS provider (mock & BMS)", () => {
  const originalEnv = { ...process.env };
  const wroteDevOutbox = (runMutation: ReturnType<typeof vi.fn>) =>
    runMutation.mock.calls.some(call => call[1] && typeof call[1] === "object" && "phone" in call[1] && "message" in call[1]);

  beforeEach(() => {
    clearMockSentMessages();
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("mock provider records sent messages in memory", async () => {
    process.env.SMS_PROVIDER = "mock";
    const res = await sendSms({
      to: "+233241234567",
      message: "Test message",
      kind: "notice",
    });
    expect(res.ok).toBe(true);
    const messages = getMockSentMessages();
    expect(messages.length).toBe(1);
    expect(messages[0].to).toBe("+233241234567");
    expect(messages[0].message).toBe("Test message");
  });

  it("fails closed without sending when the provider is unset or unknown", async () => {
    delete process.env.SMS_PROVIDER;
    process.env.ALLOW_DEV_SMS_OUTBOX = "true";
    const runMutation = vi.fn();
    const unset = await sendSms({ to: "+233241234567", message: "Test", kind: "otp" }, { runMutation });
    expect(unset).toMatchObject({ ok: false, errorCode: "not_configured" });
    expect(getMockSentMessages()).toHaveLength(0);
    expect(wroteDevOutbox(runMutation)).toBe(false);

    process.env.SMS_PROVIDER = "unknown";
    const unknown = await sendSms({ to: "+233241234567", message: "Test", kind: "otp" }, { runMutation });
    expect(unknown).toMatchObject({ ok: false, errorCode: "not_configured" });
    expect(wroteDevOutbox(runMutation)).toBe(false);
  });

  it("fails closed without BMS credentials", async () => {
    process.env.SMS_PROVIDER = "bms";
    delete process.env.BMS_SMS_API_KEY;
    delete process.env.BMS_SMS_SENDER_ID;

    const res = await sendSms({
      to: "+233241234567",
      message: "Test",
      kind: "otp",
    });

    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("not_configured");
  });

  it("formats BMS request correctly, sending sms_type ONLY for otp", async () => {
    process.env.SMS_PROVIDER = "bms";
    process.env.BMS_SMS_API_KEY = "secret_api_key_12345";
    process.env.BMS_SMS_SENDER_ID = "GabbyNewluk";

    let capturedUrl = "";
    let capturedBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedBody = JSON.parse(init?.body as string);
      return new Response(
        JSON.stringify({
          status: "success",
          code: "2000",
          message: "Message sent",
          summary: {
            _id: "bms_msg_1",
            type: "quick",
            total_sent: 1,
            contacts: 1,
            total_rejected: 0,
            numbers_sent: 1,
            credit_used: 1,
            credit_left: 80,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    // 1. Test OTP send
    const otpRes = await sendSms({
      to: "+233241234567",
      message: "OTP Code 123",
      kind: "otp",
    });

    expect(otpRes.ok).toBe(true);
    expect(otpRes.providerMessageId).toBe("bms_msg_1");
    expect(otpRes.creditLeft).toBe(80);
    expect(capturedUrl).toContain("https://api.mnotify.com/api/sms/quick?key=");
    expect(capturedBody).toEqual({
      recipient: ["0241234567"],
      sender: "GabbyNewluk",
      message: "OTP Code 123",
      is_schedule: false,
      schedule_date: "",
      sms_type: "otp",
    });

    // 2. Test notice send -> no sms_type in body
    await sendSms({
      to: "+233241234567",
      message: "Password changed",
      kind: "notice",
    });

    expect(capturedBody.sms_type).toBeUndefined();
  });

  it("classifies HTTP, provider rejection, and malformed responses", async () => {
    process.env.SMS_PROVIDER = "bms";
    process.env.BMS_SMS_API_KEY = "secret_key";
    process.env.BMS_SMS_SENDER_ID = "Gabby";

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // HTTP 500
    global.fetch = vi.fn().mockResolvedValueOnce(new Response("Internal Error", { status: 500 }));
    let res = await sendSms({ to: "+233241234567", message: "m", kind: "otp" });
    expect(res).toMatchObject({ ok: false, errorCode: "http_error", providerStatus: 500 });

    // status error
    global.fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ status: "error", code: "2000" }), { status: 200 }));
    res = await sendSms({ to: "+233241234567", message: "m", kind: "otp" });
    expect(res.errorCode).toBe("provider_rejected");

    // code not 2000
    global.fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ status: "success", code: "4001" }), { status: 200 }));
    res = await sendSms({ to: "+233241234567", message: "m", kind: "otp" });
    expect(res.errorCode).toBe("provider_rejected");

    // total_rejected 1
    global.fetch = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({
        status: "success",
        code: "2000",
        summary: { total_sent: 0, total_rejected: 1, credit_left: 50 },
      }), { status: 200 })
    );
    res = await sendSms({ to: "+233241234567", message: "m", kind: "otp" });
    expect(res.errorCode).toBe("provider_rejected");

    // malformed JSON
    global.fetch = vi.fn().mockResolvedValueOnce(new Response("not json", { status: 200 }));
    res = await sendSms({ to: "+233241234567", message: "m", kind: "otp" });
    expect(res.errorCode).toBe("bad_response");

    // Network error is retried once; the second failure returns network.
    global.fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));
    res = await sendSms({ to: "+233241234567", message: "m", kind: "otp" });
    expect(res).toMatchObject({ ok: false, errorCode: "network" });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Ensure the secret API key never appears in any console log
    for (const call of errorSpy.mock.calls) {
      for (const arg of call) {
        expect(String(arg)).not.toContain("secret_key");
        expect(String(arg)).not.toContain("api.mnotify.com");
      }
    }
  });

  it("does not retry a 10-second timeout", async () => {
    process.env.SMS_PROVIDER = "bms";
    process.env.BMS_SMS_API_KEY = "test-key";
    process.env.BMS_SMS_SENDER_ID = "Gabby";
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
    }));
    global.fetch = fetchMock as typeof fetch;
    const pending = sendSms({ to: "+233241234567", message: "m", kind: "otp" });
    await vi.advanceTimersByTimeAsync(10_000);
    await expect(pending).resolves.toMatchObject({ ok: false, errorCode: "timeout" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("sanitizes provider messages and never returns the submitted SMS text", async () => {
    process.env.SMS_PROVIDER = "bms";
    process.env.BMS_SMS_API_KEY = "test-key";
    process.env.BMS_SMS_SENDER_ID = "Gabby";
    const sentText = "Private temporary password 12345";
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "error", code: "4001", message: `Rejected ${sentText} for +233241234567 https://provider.invalid/path key=super-secret-token-value`,
      summary: { total_sent: 0, total_rejected: 1 },
    }), { status: 200 }));
    const res = await sendSms({ to: "+233241234567", message: sentText, kind: "otp" });
    expect(res.errorCode).toBe("provider_rejected");
    expect(res.providerMessage).toContain("[message omitted]");
    expect(res.providerMessage).toContain("[phone omitted]");
    expect(res.providerMessage).toContain("[URL omitted]");
    expect(res.providerMessage).toContain("[redacted]");
    expect(res.providerMessage).not.toContain(sentText);
    expect(res.providerMessage).not.toContain("+233241234567");
    expect(res.providerMessage).not.toContain("super-secret-token-value");
    expect(res.providerMessage!.length).toBeLessThanOrEqual(120);
  });

  it("writes the persistent outbox only for exact mock plus the opt-in flag", async () => {
    const runMutation = vi.fn().mockResolvedValue(undefined);
    const ctx = { runMutation };
    process.env.SMS_PROVIDER = "mock";
    process.env.ALLOW_DEV_SMS_OUTBOX = "true";
    await sendSms({ to: "+233241234567", message: "mock text", kind: "otp" }, ctx);
    expect(wroteDevOutbox(runMutation)).toBe(true);

    runMutation.mockClear();
    process.env.ALLOW_DEV_SMS_OUTBOX = "false";
    await sendSms({ to: "+233241234567", message: "mock text", kind: "otp" }, ctx);
    expect(wroteDevOutbox(runMutation)).toBe(false);

    runMutation.mockClear();
    delete process.env.SMS_PROVIDER;
    process.env.ALLOW_DEV_SMS_OUTBOX = "true";
    await sendSms({ to: "+233241234567", message: "unset text", kind: "otp" }, ctx);
    expect(wroteDevOutbox(runMutation)).toBe(false);

    runMutation.mockClear();
    process.env.SMS_PROVIDER = "bms";
    delete process.env.BMS_SMS_API_KEY;
    delete process.env.BMS_SMS_SENDER_ID;
    await sendSms({ to: "+233241234567", message: "bms text", kind: "otp" }, ctx);
    expect(wroteDevOutbox(runMutation)).toBe(false);
  });

  it("calls low-credit alert when credit_left is below threshold", async () => {
    process.env.SMS_PROVIDER = "bms";
    process.env.BMS_SMS_API_KEY = "k";
    process.env.BMS_SMS_SENDER_ID = "Gabby";

    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "success",
          code: "2000",
          summary: {
            _id: "msg_low_credit",
            total_sent: 1,
            total_rejected: 0,
            credit_left: 15, // < LOW_CREDIT_THRESHOLD (50)
          },
        }),
        { status: 200 }
      )
    );

    const mockCtx = {
      runMutation: vi.fn().mockResolvedValue(undefined),
    };

    const res = await sendSms({ to: "+233241234567", message: "msg", kind: "otp" }, mockCtx);
    expect(res.ok).toBe(true);
    expect(mockCtx.runMutation).toHaveBeenCalledTimes(1);
    expect(mockCtx.runMutation).toHaveBeenCalledWith(expect.anything(), { creditLeft: 15 });
  });
});

