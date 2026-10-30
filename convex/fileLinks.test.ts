import { describe, expect, it } from 'vitest';
import { signFileLink, verifyFileLink } from './lib/fileLinks';

describe('signed staff file links', () => {
  it('accepts valid links and rejects expired, tampered, and wrong-storage signatures', async () => {
    const now = Date.now();
    const signature = await signFileLink('storage-a', now + 60_000, 'file-link-test-secret');
    expect(await verifyFileLink('storage-a', now + 60_000, signature, 'file-link-test-secret', now)).toBe(true);
    expect(await verifyFileLink('storage-a', now - 1, signature, 'file-link-test-secret', now)).toBe(false);
    expect(await verifyFileLink('storage-a', now + 60_000, `${signature}tampered`, 'file-link-test-secret', now)).toBe(false);
    expect(await verifyFileLink('storage-b', now + 60_000, signature, 'file-link-test-secret', now)).toBe(false);
  });
});
