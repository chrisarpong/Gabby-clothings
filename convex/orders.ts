import { query } from "./_generated/server";

export const getOrders = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});
