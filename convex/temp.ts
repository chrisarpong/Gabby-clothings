import { internalQuery, internalMutation } from "./_generated/server";
export const getUsers = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  }
});
export const makeAdmin = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const u of users) {
      await ctx.db.patch(u._id, { role: "admin" });
    }
  }
});
