export async function checkAdmin(ctx: any, identity: any) {
  if (identity.role === "admin") return;
  const user = await ctx.db.query("users").withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject)).first();
  if (user?.role !== "admin") throw new Error("Unauthorized: Admin access required");
}
