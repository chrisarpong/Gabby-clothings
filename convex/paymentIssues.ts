import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireStaff } from "./staffAuth";

export const list = query({
  args: { staffToken: v.string(), includeResolved: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "financials" });
    const rows = await ctx.db.query("paymentIssues").withIndex("by_resolved_createdAt", q => q.eq("resolved", args.includeResolved === true)).order("desc").take(200);
    return rows;
  },
});

export const resolve = mutation({
  args: { staffToken: v.string(), issueId: v.id("paymentIssues") },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken, { permission: "financials" });
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Payment issue not found.");
    if (!issue.resolved) {
      await ctx.db.patch(issue._id, { resolved: true });
      await ctx.db.insert("adminLogs", { userId: staff._id, adminName: staff.name, action: "Resolved Payment Issue", details: `${issue.kind}: ${issue.reference ?? issue._id}`, category: "financials", targetId: issue._id, targetType: "paymentIssues", timestamp: Date.now() });
    }
  },
});
