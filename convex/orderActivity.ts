import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v, ConvexError } from "convex/values";
import { requireStaff } from "./staffAuth";
import { hasPermission, StaffRole } from "./staffPermissions";

export const getByOrder = query({
  args: {
    staffToken: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.staffToken);
    if (!hasPermission(staff.role as StaffRole, "designer_portal") && !hasPermission(staff.role as StaffRole, "orders")) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Unauthorized: Requires orders or designer_portal permission" });
    }
    const logs = await ctx.db
      .query("orderActivityLog")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .order("asc")
      .collect();

    // Attach user details to each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.performedBy as Id<"staff">);
        return {
          ...log,
          performedByName: user ? user.name : "Unknown User",
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
    const staff = await requireStaff(ctx, args.staffToken);
    if (!hasPermission(staff.role as StaffRole, "designer_portal") && !hasPermission(staff.role as StaffRole, "orders")) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Unauthorized: Requires orders or designer_portal permission" });
    }
    await ctx.db.insert("orderActivityLog", {
      orderId: args.orderId,
      stage: "note",
      performedBy: staff._id,
      note: args.note,
      timestamp: Date.now(),
    });
  },
});
