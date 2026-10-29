import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireStaff } from "./staffAuth";

export const getByOrder = query({
  args: { staffToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "financials" });
    return await ctx.db.query("payments").withIndex("by_orderId", q => q.eq("orderId", args.orderId)).collect();
  },
});
