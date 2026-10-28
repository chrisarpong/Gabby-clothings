
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { checkRateLimit } from "./authHelper";
import { v } from "convex/values";
import { requireStaff } from "./staffAuth";

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
  args: {
      staffToken: v.string()
},
  handler: async (ctx, args) => {
      await requireStaff(ctx, args.staffToken, { permission: "messages" });
    return await ctx.db.query("messages").order("desc").collect();
  }
});

export const markAsRead = mutation({
  args: {
      staffToken: v.string(),
    messageId: v.id("messages") },
  handler: async (ctx, args) => {
      await requireStaff(ctx, args.staffToken, { permission: "messages" });
    await ctx.db.patch(args.messageId, { status: "read" });
  },
});

export const getByIdForReply = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => await ctx.db.get(args.messageId),
});

export const markRepliedInternal = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (message && message.status !== "replied") {
      await ctx.db.patch(args.messageId, { status: "replied" });
    }
  },
});
