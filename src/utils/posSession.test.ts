import { describe, expect, it } from 'vitest';
import { loadPosCustomer, prefillPosCustomer } from './posSession';
describe('POS session customer prefill', () => {
  it('round trips through the POS loader', () => {
    prefillPosCustomer('staff-test', { name: 'A Client', email: 'a@example.test', phone: '0200' });
    expect(loadPosCustomer('staff-test')).toEqual({ name: 'A Client', email: 'a@example.test', phone: '0200' });
  });
});
