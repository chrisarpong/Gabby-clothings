import { query } from "./_generated/server";
export default query(async (ctx) => {
  try {
    return await ctx.db.query("settings").first();
  } catch(e: any) {
    return e.toString();
  }
});
