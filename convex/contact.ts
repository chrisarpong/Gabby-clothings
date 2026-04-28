import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";

export const submitMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("contactMessages", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      status: "unread",
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

export const getMessages = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("contactMessages").order("desc").collect();
  },
});
