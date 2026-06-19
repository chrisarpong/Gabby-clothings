import { checkAdmin } from "./authHelper";
import { query, mutation } from "./_generated/server";
import { checkRateLimit } from "./authHelper";
import { v } from "convex/values";

export const submitMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, "submitMessage", 5, 60000); // 5 per minute
    return await ctx.db.insert("messages", {
      ...args,
      status: "unread",
    });
  }
});

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.query("messages").order("desc").collect();
  }
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await checkAdmin(ctx, identity);
    await ctx.db.patch(args.messageId, { status: "read" });
  },
});
