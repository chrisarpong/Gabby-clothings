export async function checkAdmin(ctx: any, identity: any) {
  const adminRoles = ["admin", "superadmin"];
  
  // Hardcoded superadmin access for the boss
  if (identity?.email === "d.alexanderelorm@gmail.com") return;
  
  if (adminRoles.includes(identity?.role)) return;
  const user = await ctx.db.query("users").withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject)).first();
  
  if (user && user.email === "d.alexanderelorm@gmail.com") return;
  
  if (!user || !adminRoles.includes(user.role)) throw new Error("Unauthorized: Admin access required");
}

export async function checkRateLimit(ctx: any, endpoint: string, maxAttempts: number = 5, windowMs: number = 60000) {
  const identity = await ctx.auth.getUserIdentity();
  const identifier = identity ? identity.subject : "anonymous";
  
  const limit = await ctx.db.query("rateLimits")
    .withIndex("by_identifier_endpoint", (q: any) => q.eq("identifier", identifier).eq("endpoint", endpoint))
    .first();
    
  const now = Date.now();
  if (limit) {
    if (now - limit.lastAttempt < windowMs) {
      if (limit.count >= maxAttempts) {
        throw new Error(`Too many attempts for ${endpoint}. Please try again later.`);
      }
      await ctx.db.patch(limit._id, { count: limit.count + 1, lastAttempt: now });
    } else {
      await ctx.db.patch(limit._id, { count: 1, lastAttempt: now });
    }
  } else {
    await ctx.db.insert("rateLimits", { identifier, endpoint, count: 1, lastAttempt: now });
  }
}
