export async function checkRateLimit(ctx: any, endpoint: string, maxAttempts: number = 5, windowMs: number = 60000, anonymousKey?: string) {
  const identity = await ctx.auth.getUserIdentity();
  let identifier = identity?.subject;
  if (!identifier) {
    const key = anonymousKey?.trim().toLowerCase() || "anonymous";
    const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    identifier = `anon:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")}`;
  }
  const globalIdentifier = `global:${endpoint}`;
  const globalLimit = await ctx.db.query("rateLimits").withIndex("by_identifier_endpoint", (q: any) => q.eq("identifier", globalIdentifier).eq("endpoint", endpoint)).first();
  const now = Date.now();
  if (globalLimit && now - globalLimit.lastAttempt < 60000 && globalLimit.count >= 120) throw new Error(`Too many attempts for ${endpoint}. Please try again later.`);
  if (globalLimit && now - globalLimit.lastAttempt < 60000) await ctx.db.patch(globalLimit._id, { count: globalLimit.count + 1, lastAttempt: now });
  else if (globalLimit) await ctx.db.patch(globalLimit._id, { count: 1, lastAttempt: now });
  else await ctx.db.insert("rateLimits", { identifier: globalIdentifier, endpoint, count: 1, lastAttempt: now });
  
  const limit = await ctx.db.query("rateLimits")
    .withIndex("by_identifier_endpoint", (q: any) => q.eq("identifier", identifier).eq("endpoint", endpoint))
    .first();
    
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
