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
