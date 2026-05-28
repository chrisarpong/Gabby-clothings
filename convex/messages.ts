import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
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
    if ((identity as any).role !== "admin") throw new Error("Unauthorized: Admin access required");
    return await ctx.db.query("messages").order("desc").collect();
  }
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    if ((identity as any).role !== "admin") throw new Error("Unauthorized: Admin access required");
    await ctx.db.patch(args.messageId, { status: "read" });
  },
});
