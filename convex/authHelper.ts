export async function checkAdmin(ctx: any, identity: any) {
  // Hardcoded superadmin access for the boss
  if (identity?.email === "d.alexanderelorm@gmail.com") return;
  
  const user = await ctx.db.query("users").withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject)).first();
  if (user && user.email === "d.alexanderelorm@gmail.com") return;
  
  // Backward compatibility + basic "is staff" check
  const legacyAdminRoles = ["admin", "superadmin", "staff"];
  if (legacyAdminRoles.includes(identity?.role)) return;
  if (user && legacyAdminRoles.includes(user.role)) return;
  if (user && user.roleId) return; // Any user with a roleId is staff
  
  throw new Error("Unauthorized: Staff access required");
}

export async function checkPermission(ctx: any, identity: any, requiredPermission: string) {
  // Hardcoded superadmin access for the boss bypasses permission checks
  if (identity?.email === "d.alexanderelorm@gmail.com") return;
  
  const user = await ctx.db.query("users").withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject)).first();
  if (user && user.email === "d.alexanderelorm@gmail.com") return;
  
  if (!user) throw new Error("Unauthorized: User not found");
  
  // Legacy superadmins get all permissions
  if (user.role === "superadmin") return;

  if (!user.roleId) {
    throw new Error(`Unauthorized: Missing required permission '${requiredPermission}'`);
  }

  const role = await ctx.db.get(user.roleId);
  if (!role || (!role.permissions.includes(requiredPermission) && !role.permissions.includes("all"))) {
    throw new Error(`Unauthorized: Missing required permission '${requiredPermission}'`);
  }
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
