import { checkAdmin } from "./authHelper";
import { query, mutation } from "./_generated/server";
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
      const staff = await requireStaff(ctx, args.staffToken, { permission: "dashboard" });
    return await ctx.db.query("messages").order("desc").collect();
  }
});

export const markAsRead = mutation({
  args: {
      staffToken: v.string(),
    messageId: v.id("messages") },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "dashboard" });
    await ctx.db.patch(args.messageId, { status: "read" });
  },
});
