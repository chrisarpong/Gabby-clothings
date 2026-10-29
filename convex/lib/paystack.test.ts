import { afterEach, describe, expect, it, vi } from "vitest";
import { constantTimeEqual, generatePaymentReference, verifyPaystackTransaction } from "./paystack";

const originalSecret = process.env.PAYSTACK_SECRET_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
  else process.env.PAYSTACK_SECRET_KEY = originalSecret;
});

describe("Paystack verification helpers", () => {
  it("compares signatures without accepting different values", () => {
    expect(constantTimeEqual("abc123", "abc123")).toBe(true);
    expect(constantTimeEqual("abc123", "abc124")).toBe(false);
    expect(constantTimeEqual("short", "longer")).toBe(false);
  });

  it("generates unique URL-safe payment references", () => {
    const first = generatePaymentReference();
    const second = generatePaymentReference();
    expect(first).toMatch(/^GB-[A-Za-z0-9_-]{20}$/);
    expect(second).not.toBe(first);
  });

  it("returns Paystack amount in pesewas and payment details unchanged", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_unit_test_only";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: true,
      data: {
        status: "success",
        amount: 12345,
        currency: "GHS",
        reference: "GB-TEST-REF",
        customer: { email: "buyer@example.test" },
        paid_at: "2026-10-29T00:00:00Z",
      },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyPaystackTransaction("GB-TEST-REF");
    expect(result).toEqual({
      ok: true,
      status: "success",
      amountPesewas: 12345,
      currency: "GHS",
      reference: "GB-TEST-REF",
      customerEmail: "buyer@example.test",
      paidAt: "2026-10-29T00:00:00Z",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it("retries once after a network error", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_unit_test_only";
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error("network failure"))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: true,
        data: { status: "failed", amount: 100, currency: "GHS", reference: "GB-RETRY" },
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyPaystackTransaction("GB-RETRY");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ ok: false, status: "failed", amountPesewas: 100, reference: "GB-RETRY" });
  });

  it("does not retry deterministic HTTP failures and rejects non-test keys", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_unit_test_only";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await verifyPaystackTransaction("GB-BAD")).toMatchObject({ ok: false, status: "http_401" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    process.env.PAYSTACK_SECRET_KEY = "sk_live_never_use";
    await expect(verifyPaystackTransaction("GB-BAD")).rejects.toThrow("test key");
  });
});
