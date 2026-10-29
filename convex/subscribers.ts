import { requireStaff } from "./staffAuth";
import { query, mutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { checkRateLimit } from "./authHelper";
import { v, ConvexError } from "convex/values";
import { unsubscribeToken, constantTimeEqual } from './lib/unsubscribe';

export const getAll = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "marketing" });
    return await ctx.db.query("subscribers").order("desc").collect();
  },
});

export const getUnsubscribedEmails = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("subscribers").collect();
    return rows.filter(row => row.status === "unsubscribed").map(row => row.email.trim().toLowerCase());
  },
});

export const unsubscribe = mutation({
  args: { email: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    await checkRateLimit(ctx, 'unsubscribe', 10, 60000, email);
    const secret = process.env.UNSUBSCRIBE_SECRET;
    if (!secret) throw new ConvexError('Unsubscribe is temporarily unavailable.');
    const expected = await unsubscribeToken(email, secret);
    if (!constantTimeEqual(expected, args.token)) throw new ConvexError('Invalid unsubscribe link.');
    const subscriber = await ctx.db.query('subscribers').withIndex('by_email', q => q.eq('email', email)).first();
    if (subscriber && subscriber.status !== 'unsubscribed') await ctx.db.patch(subscriber._id, { status: 'unsubscribed' });
    if (!subscriber) await ctx.db.insert('subscribers', { email, status: 'unsubscribed' });
    return { status: 'unsubscribed' };
  },
});

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    await checkRateLimit(ctx, "subscribe", 5, 60000, email); // 5 per minute per identity/email

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      if (existing.status === "unsubscribed") {
        await ctx.db.patch(existing._id, { status: "active" });
        await ctx.db.insert("adminLogs", {
          userId: null,
          adminName: "System",
          action: "Subscriber Resubscribed",
          category: "marketing",
          details: "Subscriber explicitly submitted the newsletter form again.",
          targetId: existing._id,
          targetType: "subscriber",
          timestamp: Date.now(),
        });
      }
      return existing._id;
    }
    const subId = await ctx.db.insert("subscribers", {
      email,
      status: "active",
    });
    
    await ctx.scheduler.runAfter(0, internal.email.sendSubscriptionConfirmation, { email });
    
    return subId;
  },
});
