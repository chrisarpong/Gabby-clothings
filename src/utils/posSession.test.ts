import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPosCustomer, prefillPosCustomer } from './posSession';

afterEach(() => vi.unstubAllGlobals());

describe('POS session customer prefill', () => {
  it('round trips through the POS loader', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      setItem: (key: string, value: string) => values.set(key, value),
      getItem: (key: string) => values.get(key) ?? null,
    });
    prefillPosCustomer('staff-test', { name: 'A Client', email: 'a@example.test', phone: '0200' });
    expect(loadPosCustomer('staff-test')).toEqual({ name: 'A Client', email: 'a@example.test', phone: '0200' });
  });
});
