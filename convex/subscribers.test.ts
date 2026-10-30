import { describe, expect, it, vi } from 'vitest';
import { convexTest } from 'convex-test';
import schema from './schema';
import { api, internal } from './_generated/api';
import * as crypto from 'crypto';
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

  it('broadcasts skip unsubscribed clients while sending active subscribers', async () => {
    process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret';
    process.env.RESEND_API_KEY = 're_test';
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 'email-test' }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const t = convexTest(schema);
    const token = 'marketing-test-token';
    await t.run(async ctx => {
      const staffId = await ctx.db.insert('staff', { name: 'CEO', email: 'ceo@test.local', role: 'ceo', passwordHash: 'x', passwordSalt: 'x', mustChangePassword: false, isActive: true, failedAttempts: 0, totpEnabled: true, createdAt: Date.now() });
      await ctx.db.insert('staffSessions', { staffId, tokenHash: crypto.createHash('sha256').update(token).digest('hex'), createdAt: Date.now(), lastActivityAt: Date.now(), expiresAt: Date.now() + 3600000 });
      await ctx.db.insert('users', { clerkId: 'unsub-client', email: 'UNSUB@example.test', firstName: 'Skip', role: 'client' });
      await ctx.db.insert('users', { clerkId: 'active-client', email: 'active@example.test', firstName: 'Send', role: 'client' });
      await ctx.db.insert('subscribers', { email: 'unsub@example.test', status: 'unsubscribed' });
      await ctx.db.insert('subscribers', { email: 'active@example.test', status: 'active' });
    });
    await t.action(api.email.sendPromoBroadcast, { staffToken: token, promoCode: 'TEST', discountValue: 10 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('reactivates an explicitly resubmitted email and audits the change', async () => {
    const t = convexTest(schema);
    const id = await t.run(ctx => ctx.db.insert('subscribers', { email: 'returning@example.com', status: 'unsubscribed' }));
    await t.mutation(api.subscribers.subscribe, { email: ' returning@example.com ' });
    expect(await t.run(ctx => ctx.db.get(id))).toMatchObject({ email: 'returning@example.com', status: 'active' });
    expect(await t.run(ctx => ctx.db.query('adminLogs').filter(q => q.eq(q.field('action'), 'Subscriber Resubscribed')).first())).toMatchObject({ category: 'marketing', targetType: 'subscriber' });
  });

  it('puts a signed unsubscribe link in the subscription confirmation', async () => {
    process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret';
    process.env.RESEND_API_KEY = 're_test';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options: any) => {
      requestBody = options.body;
      return new Response(JSON.stringify({ id: 'welcome-email' }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchMock);
    const t = convexTest(schema);
    await t.action(internal.email.sendSubscriptionConfirmation, { email: 'welcome@example.test' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestBody).toContain('unsubscribe?email=welcome%40example.test&token=');
    vi.unstubAllGlobals();
  });

  it('does not put unsubscribe links in transactional order confirmation', async () => {
    process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret';
    process.env.RESEND_API_KEY = 're_test';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options: any) => {
      requestBody = options.body;
      return new Response(JSON.stringify({ id: 'order-email' }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchMock);
    const t = convexTest(schema);
    const orderId = await t.run(ctx => ctx.db.insert('orders', { items: [], totalAmount: 10, status: 'processing' }));
    await t.action(internal.email.sendOrderConfirmation, { orderId, email: 'buyer@example.test', name: 'Buyer', amount: 10 });
    expect(requestBody).not.toContain('unsubscribe');
    vi.unstubAllGlobals();
  });
});
