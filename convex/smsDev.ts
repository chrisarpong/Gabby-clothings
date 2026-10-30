import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const lastMessage = internalQuery({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("devSmsOutbox")
      .withIndex("by_phone", q => q.eq("phone", args.phone))
      .order("desc")
      .first();
  }
});

export const recordDevMessage = internalMutation({
  args: { phone: v.string(), message: v.string(), kind: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("devSmsOutbox", {
      phone: args.phone,
      message: args.message,
      kind: args.kind,
      createdAt: Date.now(),
    });
    const all = await ctx.db.query("devSmsOutbox").order("desc").collect();
    if (all.length > 20) {
      for (const excess of all.slice(20)) {
        await ctx.db.delete(excess._id);
      }
    }
  }
});

