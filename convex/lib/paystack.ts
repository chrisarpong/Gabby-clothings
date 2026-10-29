export type VerifiedPaystackTransaction = {
  ok: boolean;
  status: string;
  amountPesewas: number;
  currency: string;
  reference: string;
  customerEmail?: string;
  paidAt?: string;
};

export function constantTimeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let mismatch = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) mismatch |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return mismatch === 0;
}

export function generatePaymentReference(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(20));
  return `GB-${Array.from(bytes, byte => alphabet[byte & 63]).join("")}`;
}

export async function verifyPaystackTransaction(reference: string): Promise<VerifiedPaystackTransaction> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !secret.startsWith("sk_test_")) {
    throw new Error("PAYSTACK_SECRET_KEY must be configured with a Paystack test key.");
  }

  let response: Response | undefined;
  let payload: any;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
        signal: controller.signal,
      });
      if (!response.ok) {
        clearTimeout(timeout);
        return { ok: false, status: `http_${response.status}`, amountPesewas: 0, currency: "", reference };
      }
      payload = await response.json();
      clearTimeout(timeout);
      break;
    } catch {
      clearTimeout(timeout);
      if (attempt === 1) throw new Error("Paystack verification could not connect. Please do not pay again; your payment status is being checked.");
    }
  }

  if (!payload?.status || !payload?.data || typeof payload.data.status !== "string") {
    return { ok: false, status: "invalid_response", amountPesewas: 0, currency: "", reference };
  }
  const data = payload.data;
  const amountPesewas = Number(data.amount);
  if (!Number.isSafeInteger(amountPesewas) || amountPesewas < 0) {
    return { ok: false, status: "invalid_amount", amountPesewas: 0, currency: String(data.currency ?? ""), reference: String(data.reference ?? reference) };
  }

  return {
    ok: data.status === "success",
    status: data.status,
    amountPesewas,
    currency: typeof data.currency === "string" ? data.currency : "",
    reference: typeof data.reference === "string" ? data.reference : reference,
    customerEmail: typeof data.customer?.email === "string" ? data.customer.email : undefined,
    paidAt: typeof data.paid_at === "string" ? data.paid_at : undefined,
  };
}
