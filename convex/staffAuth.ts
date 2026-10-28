import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v, ConvexError } from "convex/values";
import { StaffPermission, StaffRole, hasPermission } from "./staffPermissions";

const IDLE_TIMEOUT_MAP: Record<StaffRole, number> = {
  sales: 5 * 60 * 1000,
  designer: 15 * 60 * 1000,
  admin: 15 * 60 * 1000,
  ceo: 15 * 60 * 1000,
};

const MAX_SESSION_LENGTH = 12 * 60 * 60 * 1000; // 12 hours

export const getStaffForLogin = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", args.email)).first();
  }
});

export const getStaffById = internalQuery({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.staffId);
  }
});

export const checkLoginRateLimit = internalMutation({
  args: { email: v.string(), ip: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Global throttle (30 failures / minute)
    let globalLimit = await ctx.db.query("rateLimits")
      .withIndex("by_identifier_endpoint", q => q.eq("identifier", "global_failed_logins").eq("endpoint", "staffLogin"))
      .first();
      
    if (globalLimit) {
      if (now - globalLimit.lastAttempt < 60 * 1000) {
        if (globalLimit.count >= 30) return { allowed: false, reason: "global" };
      }
    }

    const ipIdentifier = args.ip ? `ip_${args.ip}` : `email_${args.email}`;
    
    let limit = await ctx.db.query("rateLimits")
      .withIndex("by_identifier_endpoint", q => q.eq("identifier", ipIdentifier).eq("endpoint", "staffLogin"))
      .first();
      
    const windowMs = 5 * 60 * 1000;
    const maxAttempts = 10;
    
    if (limit) {
      if (now - limit.lastAttempt < windowMs) {
        if (limit.count >= maxAttempts) return { allowed: false, reason: "ip" };
        await ctx.db.patch(limit._id, { count: limit.count + 1, lastAttempt: now });
      } else {
        await ctx.db.patch(limit._id, { count: 1, lastAttempt: now });
      }
    } else {
      await ctx.db.insert("rateLimits", { identifier: ipIdentifier, endpoint: "staffLogin", count: 1, lastAttempt: now });
    }
    return { allowed: true };
  }
});

export const recordFailedLogin = internalMutation({
  args: { email: v.string(), ip: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    let globalLimit = await ctx.db.query("rateLimits")
      .withIndex("by_identifier_endpoint", q => q.eq("identifier", "global_failed_logins").eq("endpoint", "staffLogin"))
      .first();
      
    if (globalLimit) {
      if (now - globalLimit.lastAttempt < 60 * 1000) {
        await ctx.db.patch(globalLimit._id, { count: globalLimit.count + 1, lastAttempt: now });
      } else {
        await ctx.db.patch(globalLimit._id, { count: 1, lastAttempt: now });
      }
    } else {
      await ctx.db.insert("rateLimits", { identifier: "global_failed_logins", endpoint: "staffLogin", count: 1, lastAttempt: now });
    }

    const staff = await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", args.email)).first();
    if (!staff) return { lockedNow: false };
    
    const newAttempts = staff.failedAttempts + 1;
    if (newAttempts >= 5) {
      await ctx.db.patch(staff._id, {
        failedAttempts: 0,
        lockedUntil: now + 15 * 60 * 1000 // 15 mins lock
      });
      return { lockedNow: true };
    } else {
      await ctx.db.patch(staff._id, { failedAttempts: newAttempts });
      return { lockedNow: false };
    }
  }
});

export const createSession = internalMutation({
  args: { staffId: v.id("staff"), tokenHash: v.string(), ip: v.optional(v.string()), userAgent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.staffId, {
      failedAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: Date.now(),
    });
    
    await ctx.db.insert("staffSessions", {
      staffId: args.staffId,
      tokenHash: args.tokenHash,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + MAX_SESSION_LENGTH,
      ip: args.ip,
      userAgent: args.userAgent,
    });
  }
});

export async function validateStaffSession(ctx: any, token: string) {
  if (!token) throw new ConvexError({ code: "UNAUTHENTICATED" });

  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const session = await ctx.db.query("staffSessions").withIndex("by_tokenHash", (q: any) => q.eq("tokenHash", tokenHash)).first();
  if (!session) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid session" });
  if (session.revokedAt) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Session revoked" });
  if (Date.now() > session.expiresAt) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Session expired" });
  
  const staff = await ctx.db.get(session.staffId as Id<"staff">);
  if (!staff || !staff.isActive) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Staff account inactive" });
  
  const role = staff.role as StaffRole;
  const idleTimeout = IDLE_TIMEOUT_MAP[role] || 15 * 60 * 1000;
  
  // UI idle + 90s grace
  if (Date.now() - session.lastActivityAt > idleTimeout + 90 * 1000) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Session idle timeout" });
  }

  return { staff, session: session as { _id: Id<"staffSessions">; staffId: Id<"staff">; revokedAt?: number; lastActivityAt: number; [key: string]: any } };
}

export async function requireStaff(
  ctx: any,
  token: string,
  options?: { permission?: StaffPermission | StaffPermission[] },
) {
  const { staff } = await validateStaffSession(ctx, token);
  const permissions = options?.permission
    ? Array.isArray(options.permission) ? options.permission : [options.permission]
    : [];
  if (permissions.length > 0 && !permissions.some((permission) => hasPermission(staff.role as StaffRole, permission))) {
    throw new ConvexError({ code: "FORBIDDEN", message: `Unauthorized: Requires ${permissions.join(" or ")}` });
  }
  return staff;
}

export const validateSession = internalQuery({
  args: { tokenHash: v.string(), permission: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Used by actions which have hashed the token themselves.
    const session = await ctx.db.query("staffSessions").withIndex("by_tokenHash", q => q.eq("tokenHash", args.tokenHash)).first();
    if (!session || session.revokedAt || Date.now() > session.expiresAt) return null;
    
    const staff = await ctx.db.get(session.staffId);
    if (!staff || !staff.isActive) return null;
    
    const role = staff.role as StaffRole;
    const idleTimeout = IDLE_TIMEOUT_MAP[role] || 15 * 60 * 1000;
    
    if (Date.now() - session.lastActivityAt > idleTimeout + 90 * 1000) {
      return null;
    }
    
    if (args.permission && !hasPermission(staff.role as StaffRole, args.permission)) {
      return null;
    }
    
    return staff;
  }
});

export const logout = mutation({
  args: { staffToken: v.string() }, 
  handler: async (ctx, args) => {
    const { session } = await validateStaffSession(ctx, args.staffToken).catch(() => ({ session: null }));
    if (session) {
      await ctx.db.patch(session._id, { revokedAt: Date.now() });
      
      const staff = await ctx.db.get(session.staffId);
      if (staff) {
        await ctx.db.insert("adminLogs", {
          userId: staff._id,
          adminName: staff.name,
          action: "Logout",
          category: "auth",
          timestamp: Date.now(),
        });
      }
    }
  }
});

export const revokeAllMySessions = mutation({
  args: { staffToken: v.string() }, 
  handler: async (ctx, args) => {
    const { session } = await validateStaffSession(ctx, args.staffToken);
    
    const staff = await ctx.db.get(session.staffId);
    if (!staff) return;
    
    const allSessions = await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", staff._id)).collect();
    for (const s of allSessions) {
      if (!s.revokedAt) {
        await ctx.db.patch(s._id, { revokedAt: Date.now() });
      }
    }
    
    await ctx.db.insert("adminLogs", {
      userId: staff._id,
      adminName: staff.name,
      action: "Revoked All My Sessions",
      category: "auth",
      timestamp: Date.now(),
    });
  }
});

export const revokeSession = mutation({
  args: { 
    staffToken: v.string(), // caller's token
    targetSessionId: v.id("staffSessions")
  }, 
  handler: async (ctx, args) => {
    const callerStaff = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    
    const targetSession = await ctx.db.get(args.targetSessionId);
    if (targetSession) {
      await ctx.db.patch(targetSession._id, { revokedAt: Date.now() });
      const targetStaff = await ctx.db.get(targetSession.staffId);
      
      await ctx.db.insert("adminLogs", {
        userId: callerStaff._id,
        adminName: callerStaff.name,
        action: "Forced Revoke Session",
        details: `Target: ${targetStaff?.name || targetSession.staffId}`,
        category: "auth",
        timestamp: Date.now(),
      });
    }
  }
});

export const updatePassword = internalMutation({
  args: {
    staffId: v.id("staff"),
    passwordHash: v.string(),
    passwordSalt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.staffId, {
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      mustChangePassword: false,
    });
    
    // Revoke all existing sessions for this staff member
    const sessions = await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", args.staffId)).collect();
    for (const session of sessions) {
      if (!session.revokedAt) {
        await ctx.db.patch(session._id, { revokedAt: Date.now() });
      }
    }
  }
});

export const getStaffProfile = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    try {
      const staff = await requireStaff(ctx, args.staffToken);
      const { passwordHash, passwordSalt, totpSecret, recoveryCodes, ...safeProfile } = staff;
      return safeProfile;
    } catch (e: any) {
      if (e instanceof ConvexError && (e.data as any)?.code === "UNAUTHENTICATED") return null;
      throw e;
    }
  }
});

export const heartbeat = mutation({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    const { session } = await validateStaffSession(ctx, args.staffToken);
    
    // Throttle updates to lastActivityAt (e.g. every 30 seconds)
    if (Date.now() - session.lastActivityAt > 30 * 1000) {
      await ctx.db.patch(session._id, { lastActivityAt: Date.now() });
    }
  }
});

export const cleanupSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("staffSessions").collect();
    const now = Date.now();
    for (const session of sessions) {
      if (session.revokedAt) continue;
      
      const staff = await ctx.db.get(session.staffId);
      if (!staff) continue;
      
      const role = staff.role as StaffRole;
      const idleTimeout = IDLE_TIMEOUT_MAP[role] || 15 * 60 * 1000;
      
      const isIdleExpired = now - session.lastActivityAt > idleTimeout + 90 * 1000;
      const isAbsExpired = now > session.expiresAt;
      
      if (isIdleExpired || isAbsExpired) {
        await ctx.db.patch(session._id, { revokedAt: now });
        await ctx.db.insert("adminLogs", {
          userId: staff._id,
          adminName: staff.name,
          action: isIdleExpired ? "Idle Logout" : "Session Expired",
          category: "auth",
          timestamp: now,
        });
      }
      
      // Delete older than 30 days
      if (now - session.createdAt > 30 * 24 * 60 * 60 * 1000) {
        await ctx.db.delete(session._id);
      }
    }
  }
});

// --- CEO Team Management Functions ---

export const createStaffInternal = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdBy: v.id("staff"),
    callerName: v.string(),
  },
  handler: async (ctx, args) => {
    const staffId = await ctx.db.insert("staff", {
      name: args.name,
      email: args.email,
      role: args.role,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      mustChangePassword: true,
      isActive: true,
      failedAttempts: 0,
      totpEnabled: false,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    await ctx.db.insert("adminLogs", {
      userId: args.createdBy,
      adminName: args.callerName,
      action: "Created Staff User",
      details: `Email: ${args.email}, Role: ${args.role}`,
      category: "team",
      targetId: staffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});

export const updateStaffPasswordInternal = internalMutation({
  args: {
    targetStaffId: v.id("staff"),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    callerId: v.id("staff"),
    callerName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.targetStaffId, {
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      mustChangePassword: true,
      failedAttempts: 0,
      lockedUntil: undefined,
    });

    // Revoke all sessions for target staff
    const sessions = await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId)).collect();
    for (const session of sessions) {
      if (!session.revokedAt) {
        await ctx.db.patch(session._id, { revokedAt: Date.now() });
      }
    }

    await ctx.db.insert("adminLogs", {
      userId: args.callerId,
      adminName: args.callerName,
      action: "Reset Staff Password",
      category: "team",
      targetId: args.targetStaffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});

export const listStaff = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    const staff = await ctx.db.query("staff").collect();
    return staff.map(({ passwordHash, passwordSalt, totpSecret, recoveryCodes, ...safeProfile }) => safeProfile);
  }
});

export const listAssignableDesigners = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: ["orders", "appointments"] });
    const designers = await ctx.db.query("staff").withIndex("by_role", q => q.eq("role", "designer")).take(500);
    return designers.filter(designer => designer.isActive).map(({ _id, name }) => ({ _id, name }));
  },
});

export const toggleStaffActive = mutation({
  args: {
    staffToken: v.string(),
    targetStaffId: v.id("staff"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    await ctx.db.patch(args.targetStaffId, { isActive: args.isActive });

    if (!args.isActive) {
      // Revoke all sessions if deactivated
      const sessions = await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId)).collect();
      for (const session of sessions) {
        if (!session.revokedAt) {
          await ctx.db.patch(session._id, { revokedAt: Date.now() });
        }
      }
    }

    await ctx.db.insert("adminLogs", {
      userId: caller._id,
      adminName: caller.name,
      action: args.isActive ? "Activated Staff" : "Deactivated Staff",
      category: "team",
      targetId: args.targetStaffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});

export const updateStaffRole = mutation({
  args: {
    staffToken: v.string(),
    targetStaffId: v.id("staff"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    await ctx.db.patch(args.targetStaffId, { role: args.role });

    await ctx.db.insert("adminLogs", {
      userId: caller._id,
      adminName: caller.name,
      action: "Updated Staff Role",
      details: `New Role: ${args.role}`,
      category: "team",
      targetId: args.targetStaffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});

export const revokeStaffSessions = mutation({
  args: {
    staffToken: v.string(),
    targetStaffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    const sessions = await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId)).collect();
    
    let count = 0;
    for (const session of sessions) {
      if (!session.revokedAt) {
        await ctx.db.patch(session._id, { revokedAt: Date.now() });
        count++;
      }
    }

    await ctx.db.insert("adminLogs", {
      userId: caller._id,
      adminName: caller.name,
      action: "Revoked Staff Sessions",
      details: `Revoked ${count} active sessions`,
      category: "team",
      targetId: args.targetStaffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});

export const getStaffLogins = query({
  args: { staffToken: v.string(), targetStaffId: v.id("staff") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    return await ctx.db.query("staffSessions")
      .withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId))
      .order("desc")
      .take(10);
  }
});

export const enableStaff2FAInternal = internalMutation({
  args: {
    staffId: v.id("staff"),
    totpSecret: v.string(),
    recoveryCodes: v.string(), // hashed
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.staffId, {
      totpEnabled: true,
      totpSecret: args.totpSecret,
      recoveryCodes: args.recoveryCodes,
    });
  }
});

export const updateStaffRecoveryCodes = internalMutation({
  args: {
    staffId: v.id("staff"),
    recoveryCodes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.staffId, { recoveryCodes: args.recoveryCodes });
  }
});

export const resetStaff2FAInternal = internalMutation({
  args: {
    targetStaffId: v.id("staff"),
    callerId: v.id("staff"),
    callerName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.targetStaffId, {
      totpEnabled: false,
      totpSecret: undefined,
      recoveryCodes: undefined,
    });

    await ctx.db.insert("adminLogs", {
      userId: args.callerId,
      adminName: args.callerName,
      action: "Reset Staff 2FA",
      category: "team",
      targetId: args.targetStaffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});

export const resetStaff2FA = mutation({
  args: {
    staffToken: v.string(),
    targetStaffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    
    await ctx.db.patch(args.targetStaffId, {
      totpEnabled: false,
      totpSecret: undefined,
      recoveryCodes: undefined,
    });

    await ctx.db.insert("adminLogs", {
      userId: caller._id,
      adminName: caller.name,
      action: "Reset Staff 2FA",
      category: "team",
      targetId: args.targetStaffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});
export const updateStaffTotpSecret = internalMutation({
  args: {
    staffId: v.id("staff"),
    totpSecret: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.staffId, { totpSecret: args.totpSecret });
  }
});

export const createChallenge = internalMutation({
  args: { staffId: v.id("staff"), tokenHash: v.string(), purpose: v.union(v.literal("change_password"), v.literal("setup_2fa"), v.literal("verify_2fa")) },
  handler: async (ctx, args) => {
    // Revoke any existing challenges for this user to be safe
    const existing = await ctx.db.query("staffLoginChallenges").withIndex("by_tokenHash").filter(q => q.eq(q.field("staffId"), args.staffId)).collect();
    for (const ex of existing) {
       await ctx.db.patch(ex._id, { usedAt: Date.now() });
    }
    
    await ctx.db.insert("staffLoginChallenges", {
      staffId: args.staffId,
      tokenHash: args.tokenHash,
      purpose: args.purpose,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
      attempts: 0,
    });
  }
});

export const getChallenge = internalQuery({
  args: { tokenHash: v.string(), purpose: v.union(v.literal("change_password"), v.literal("setup_2fa"), v.literal("verify_2fa")) },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.query("staffLoginChallenges").withIndex("by_tokenHash", q => q.eq("tokenHash", args.tokenHash)).first();
    if (!challenge || challenge.usedAt || Date.now() > challenge.expiresAt || challenge.purpose !== args.purpose) return null;
    return challenge;
  }
});

export const incrementChallengeAttempts = internalMutation({
  args: { challengeId: v.id("staffLoginChallenges") },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (challenge) {
      const newAttempts = challenge.attempts + 1;
      const updates: any = { attempts: newAttempts };
      if (newAttempts >= 5) updates.usedAt = Date.now();
      await ctx.db.patch(challenge._id, updates);
      return newAttempts >= 5; // Return true if burned
    }
    return false;
  }
});

export const consumeChallenge = internalMutation({
  args: { challengeId: v.id("staffLoginChallenges") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.challengeId, { usedAt: Date.now() });
  }
});


