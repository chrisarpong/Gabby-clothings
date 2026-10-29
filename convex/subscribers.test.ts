import { describe, expect, it } from 'vitest';
import { convexTest } from 'convex-test';
import schema from './schema';
import { api } from './_generated/api';
import { unsubscribeToken } from './lib/unsubscribe';

describe('unsubscribe links', () => {
  it('accepts valid tokens, rejects wrong tokens, and is idempotent', async () => {
    process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret';
    const t = convexTest(schema);
    await t.run(ctx => ctx.db.insert('subscribers', { email: 'person@example.com', status: 'active' }));
    const token = await unsubscribeToken('PERSON@example.com', process.env.UNSUBSCRIBE_SECRET);
    await expect(t.mutation(api.subscribers.unsubscribe, { email: 'person@example.com', token: 'wrong' })).rejects.toThrow();
    await t.mutation(api.subscribers.unsubscribe, { email: 'PERSON@example.com', token });
    await t.mutation(api.subscribers.unsubscribe, { email: 'person@example.com', token });
    expect((await t.run(ctx => ctx.db.query('subscribers').first()))?.status).toBe('unsubscribed');
  });
  it('creates an unsubscribed row when the email was not subscribed', async () => {
    process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret';
    const t = convexTest(schema);
    const email = 'buyer@example.com';
    const token = await unsubscribeToken(email, process.env.UNSUBSCRIBE_SECRET);
    await t.mutation(api.subscribers.unsubscribe, { email, token });
    expect(await t.run(ctx => ctx.db.query('subscribers').withIndex('by_email', q => q.eq('email', email)).first())).toMatchObject({ email, status: 'unsubscribed' });
  });
});
