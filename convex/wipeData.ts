import { internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const wipeTestData = internalMutation({
  args: {
    confirmWipe: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (process.env.ALLOW_DATA_WIPE !== "true") {
      throw new ConvexError("Refusing to run: ALLOW_DATA_WIPE is not set to 'true'.");
    }
    if (!args.confirmWipe) {
      throw new ConvexError("Refusing to run: confirmation flag is false.");
    }

    // Wiping users, tailors, roles, staff, staffSessions, staffLoginChallenges
    
    // 1. Users
    const users = await ctx.db.query("users").collect();
    for (const u of users) await ctx.db.delete(u._id);

    // 2. Roles (no longer used)
    const roles = await ctx.db.query("roles" as any).collect().catch(() => []);
    for (const r of roles) await ctx.db.delete(r._id);

    // 3. Tailors (assuming it's a table. Oh wait, do they have a table?)
    const tailors = await ctx.db.query("tailors" as any).collect().catch(() => []);
    for (const t of tailors) await ctx.db.delete(t._id);

    // 4. Staff and related
    const staff = await ctx.db.query("staff").collect();
    for (const s of staff) await ctx.db.delete(s._id);
    
    const staffSessions = await ctx.db.query("staffSessions").collect();
    for (const s of staffSessions) await ctx.db.delete(s._id);
    
    const staffLoginChallenges = await ctx.db.query("staffLoginChallenges").collect();
    for (const c of staffLoginChallenges) await ctx.db.delete(c._id);

    return `Wiped ${users.length} users, ${roles.length} roles, ${tailors.length} tailors, ${staff.length} staff records.`;
  }
});
