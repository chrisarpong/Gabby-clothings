import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./authHelper";
import { requireStaff } from "./staffAuth";

export const getByOrder = query({
  args: {
      staffToken: v.string(),
    orderId: v.id("orders") },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "designer_portal" });
    const logs = await ctx.db
      .query("orderActivityLog")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .order("asc")
      .collect();

    // Attach user details to each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.performedBy);
        return {
          ...log,
          performedByName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        };
      })
    );

    return logsWithUsers;
  },
});

export const addNote = mutation({
  args: {
      staffToken: v.string(),
    orderId: v.id("orders"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
      const staff = await requireStaff(ctx, args.staffToken, { permission: "designer_portal" });
    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).first();
    if (!user) throw new Error("User not found");

    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: "note",
      performedBy: user._id,
      note: args.note,
      timestamp: Date.now(),
    });
  }
});
