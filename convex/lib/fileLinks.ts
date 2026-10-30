import { constantTimeEqual } from './paystack';

export async function signFileLink(storageId: string, exp: number, secret: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${storageId}.${exp}`));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyFileLink(storageId: string, exp: number, signature: string, secret: string, now = Date.now()): Promise<boolean> {
  if (!Number.isSafeInteger(exp) || exp < now || exp - now > 60_000) return false;
  return constantTimeEqual(signature, await signFileLink(storageId, exp, secret));
}
