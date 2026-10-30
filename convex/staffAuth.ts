import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v, ConvexError } from "convex/values";
import { StaffPermission, StaffRole, hasPermission, requiresTwoFactor } from "./staffPermissions";
import { normalizeGhanaPhone, maskPhone } from "./lib/phone";
import { DEFAULT_SMS_SETTINGS } from "./staffSecurity";
import {
  GLOBAL_ROLLING_10M_MAX,
  GLOBAL_ANY_OUTCOME_1H_MAX,
  ACCOUNT_COOLDOWN_SECONDS,
  ACCOUNT_HOURLY_MAX,
  ACCOUNT_DAILY_MAX,
  PHONE_HOURLY_MAX,
  PHONE_DAILY_MAX,
  TEMP_PASSWORD_EXPIRES_MS,
} from "./lib/smsLimits";

const IDLE_TIMEOUT_MAP: Record<StaffRole, number> = {
  sales: 5 * 60 * 1000,
  designer: 15 * 60 * 1000,
  admin: 15 * 60 * 1000,
  ceo: 15 * 60 * 1000,
};

const MAX_SESSION_LENGTH = 12 * 60 * 60 * 1000; // 12 hours
const VALID_STAFF_ROLES = ["ceo", "admin", "designer", "sales"] as const;
const DEV_TEAM_ROLES = ["admin", "designer", "sales"] as const;

async function getActiveCeoCount(ctx: any) {
  const ceos = await ctx.db.query("staff").withIndex("by_role", (q: any) => q.eq("role", "ceo")).collect();
  return ceos.filter((staff: any) => staff.isActive).length;
}

export const getStaffForLogin = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", args.email.trim().toLowerCase())).first();
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

    const staff = await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", args.email.trim().toLowerCase())).first();
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
  options?: { permission?: StaffPermission | StaffPermission[]; allowIncomplete?: boolean },
) {
  const { staff } = await validateStaffSession(ctx, token);
  if (!options?.allowIncomplete && (staff.mustChangePassword || (requiresTwoFactor(staff.role) && !staff.totpEnabled))) {
    throw new ConvexError({ code: "SETUP_REQUIRED", message: "Complete password and two-factor setup before continuing." });
  }
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
    keepSessionTokenHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    if (!staff) throw new Error("Staff account not found.");

    await ctx.db.patch(args.staffId, {
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      mustChangePassword: false,
      failedAttempts: 0,
      lockedUntil: undefined,
    });
    
    // Void every remaining staffPasswordResets row for that staff
    const resets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", args.staffId))
      .collect();
    const hadSmsReset = resets.length > 0;
    for (const r of resets) {
      if (!r.voidedAt && !r.usedAt) {
        await ctx.db.patch(r._id, { voidedAt: Date.now() });
      }
    }

    // Revoke all OTHER sessions for this staff member (keep the current one)
    const sessions = await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", args.staffId)).collect();
    for (const session of sessions) {
      if (!session.revokedAt && session.tokenHash !== args.keepSessionTokenHash) {
        await ctx.db.patch(session._id, { revokedAt: Date.now() });
      }
    }

    if (hadSmsReset) {
      await ctx.db.insert("adminLogs", {
        userId: args.staffId,
        adminName: staff.name,
        action: "Staff completed password change after SMS reset",
        category: "auth",
        targetId: args.staffId,
        targetType: "staff",
        timestamp: Date.now(),
      });
    }
  }
});

export const getStaffProfile = query({
  args: { staffToken: v.string() },
  handler: async (ctx, args) => {
    try {
      const staff = await requireStaff(ctx, args.staffToken, { allowIncomplete: true });
      const { passwordHash, passwordSalt, totpSecret, recoveryCodes, phone, ...safeProfile } = staff;
      return {
        ...safeProfile,
        phone: staff.role === "ceo" ? (phone ? maskPhone(phone) : undefined) : undefined,
      };
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
    const now = Date.now();
    const sessions = await ctx.db.query("staffSessions").withIndex("by_expiresAt", q => q.lt("expiresAt", now)).order("asc").take(500);
    for (const session of sessions) {
      const staff = await ctx.db.get(session.staffId);
      if (staff && !session.revokedAt) {
        await ctx.db.insert("adminLogs", {
          userId: staff._id,
          adminName: staff.name,
          action: "Session Expired",
          category: "auth",
          timestamp: now,
        });
      }
      await ctx.db.delete(session._id);
    }
    if (sessions.length === 500) await ctx.scheduler.runAfter(0, internal.staffAuth.cleanupSessions, {});
  }
});

// --- CEO Team Management Functions ---

export const createStaffInternal = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    phone: v.optional(v.string()),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdBy: v.id("staff"),
    callerName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(VALID_STAFF_ROLES as readonly string[]).includes(args.role)) {
      throw new Error("Role must be ceo, admin, designer, or sales.");
    }
    const email = args.email.trim().toLowerCase();
    if (!email) throw new Error("Email is required.");
    const existingStaff = await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", email)).first();
    if (existingStaff) {
      throw new Error("A staff account with this email already exists.");
    }
    if (args.phone) {
      const existingPhone = await ctx.db.query("staff").withIndex("by_phone", q => q.eq("phone", args.phone)).first();
      if (existingPhone) {
        throw new Error("A staff account with this phone number already exists.");
      }
    }
    const staffId = await ctx.db.insert("staff", {
      name: args.name,
      email,
      role: args.role,
      phone: args.phone,
      phoneUpdatedAt: args.phone ? Date.now() : undefined,
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
      details: `Email: ${email}, Role: ${args.role}${args.phone ? `, Phone: ${maskPhone(args.phone)}` : ""}`,
      category: "team",
      targetId: staffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
  }
});

export const bootstrapCeoInternal = internalMutation({
  args: { name: v.string(), email: v.string(), passwordHash: v.string(), passwordSalt: v.string() },
  handler: async (ctx, args) => {
    const existingCeo = await ctx.db.query("staff").withIndex("by_role", q => q.eq("role", "ceo")).first();
    if (existingCeo) throw new Error("A CEO account already exists; bootstrap is disabled.");
    const staffId = await ctx.db.insert("staff", {
      name: args.name,
      email: args.email.trim().toLowerCase(),
      role: "ceo",
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      mustChangePassword: true,
      isActive: true,
      failedAttempts: 0,
      totpEnabled: false,
      createdAt: Date.now(),
    });
    await ctx.db.insert("adminLogs", {
      userId: null,
      adminName: args.name,
      action: "Bootstrapped first CEO",
      category: "team",
      targetId: staffId,
      targetType: "staff",
      timestamp: Date.now(),
    });
    return staffId;
  },
});

export const operatorResetStaffAccessInternal = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    resetTwoFactor: v.boolean(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const staff = await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", email)).first();
    if (!staff) throw new Error("Staff account not found.");

    await ctx.db.patch(staff._id, {
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      mustChangePassword: true,
      failedAttempts: 0,
      lockedUntil: undefined,
      ...(args.resetTwoFactor ? { totpSecret: undefined, recoveryCodes: undefined, totpEnabled: false } : {}),
    });

    const sessions = await ctx.db.query("staffSessions")
      .withIndex("by_staffId", q => q.eq("staffId", staff._id))
      .collect();
    const now = Date.now();
    for (const session of sessions) {
      if (!session.revokedAt) await ctx.db.patch(session._id, { revokedAt: now });
    }

    await ctx.db.insert("adminLogs", {
      userId: null,
      adminName: "operator",
      action: args.resetTwoFactor ? "Operator Reset Staff Access and 2FA" : "Operator Reset Staff Access",
      details: `Email: ${email}`,
      category: "auth",
      targetId: staff._id,
      targetType: "staff",
      timestamp: now,
    });

    return staff._id;
  },
});

export const seedDevTeamInternal = internalMutation({
  args: { candidates: v.array(v.object({ role: v.string(), name: v.string(), email: v.string(), passwordHash: v.string(), passwordSalt: v.string() })) },
  handler: async (ctx, args) => {
    const createdRoles: string[] = [];
    for (const candidate of args.candidates) {
      if (!(DEV_TEAM_ROLES as readonly string[]).includes(candidate.role)) {
        throw new Error("Development seed contains an invalid staff role.");
      }
      const email = candidate.email.trim().toLowerCase();
      const existing = await ctx.db.query("staff").withIndex("by_email", q => q.eq("email", email)).first();
      if (existing) continue;
      await ctx.db.insert("staff", {
        name: candidate.name,
        email,
        role: candidate.role,
        passwordHash: candidate.passwordHash,
        passwordSalt: candidate.passwordSalt,
        mustChangePassword: true,
        isActive: true,
        failedAttempts: 0,
        totpEnabled: false,
        createdAt: Date.now(),
      });
      createdRoles.push(candidate.role);
    }
    return createdRoles;
  },
});

export const normalizeStaffEmails = internalMutation({
  args: {},
  handler: async (ctx) => {
    const staff = await ctx.db.query("staff").collect();
    const grouped = new Map<string, typeof staff>();
    for (const account of staff) {
      const normalized = account.email.trim().toLowerCase();
      const group = grouped.get(normalized) ?? [];
      group.push(account);
      grouped.set(normalized, group);
    }

    const collisions = [...grouped.entries()]
      .filter(([, accounts]) => accounts.length > 1)
      .map(([email, accounts]) => ({ email, staffIds: accounts.map(account => account._id) }));

    let updated = 0;
    for (const account of staff) {
      const email = account.email.trim().toLowerCase();
      if (account.email !== email) {
        await ctx.db.patch(account._id, { email });
        updated++;
      }
    }
    return { scanned: staff.length, updated, collisions };
  },
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

    // Void any pending temp resets
    const resets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId))
      .collect();
    for (const r of resets) {
      if (!r.usedAt && !r.voidedAt) {
        await ctx.db.patch(r._id, { voidedAt: Date.now() });
      }
    }

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
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    const staff = await ctx.db.query("staff").order("desc").take(500);
    return staff.map(({ passwordHash, passwordSalt, totpSecret, recoveryCodes, phone, ...safeProfile }) => ({ ...safeProfile, phone: caller.role === "ceo" ? (phone ? maskPhone(phone) : undefined) : undefined }));
  }
});

export const updateStaffPhone = mutation({
  args: { staffToken: v.string(), targetStaffId: v.id("staff"), phone: v.string() },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    if (caller.role !== "ceo") throw new ConvexError({ code: "FORBIDDEN", message: "Only the CEO may manage staff phone numbers." });
    const target = await ctx.db.get(args.targetStaffId);
    if (!target) throw new ConvexError({ code: "NOT_FOUND", message: "Staff account not found." });
    const phone = normalizeGhanaPhone(args.phone);
    await ctx.db.patch(target._id, { phone, phoneUpdatedAt: Date.now() });

    // Void any pending temp passwords when phone changes
    const earlierResets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", target._id))
      .collect();
    for (const r of earlierResets) {
      if (!r.usedAt && !r.voidedAt) {
        await ctx.db.patch(r._id, { voidedAt: Date.now() });
      }
    }

    await ctx.db.insert("adminLogs", { userId: caller._id, adminName: caller.name, action: "Updated Staff Phone", details: `Staff: ${target.name}; old: ${target.phone ? maskPhone(target.phone) : "none"}; new: ${maskPhone(phone)}`, category: "team", targetId: target._id, targetType: "staff", timestamp: Date.now() });
    return { phone: maskPhone(phone) };
  },
});

export const preparePasswordResetRequest = internalMutation({
  args: {
    emailKey: v.string(),
    normalizedEmail: v.string(),
    tempPasswordHash: v.string(),
    tempPasswordSalt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const settingsDoc = await ctx.db.query("staffSecuritySettings").first();
    const config = settingsDoc || DEFAULT_SMS_SETTINGS;

    if (!config.smsResetEnabled) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        outcome: "disabled",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "disabled" as const };
    }

    const oneHourAgo = now - 60 * 60 * 1000;
    const globalHourlyLogs = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_createdAt", q => q.gte("createdAt", oneHourAgo))
      .collect();

    if (globalHourlyLogs.length >= GLOBAL_ANY_OUTCOME_1H_MAX) {
      return { allowed: false, reason: "global_rate_limited" as const };
    }

    const tenMinAgo = now - 10 * 60 * 1000;
    const global10mSent = globalHourlyLogs.filter(l => l.createdAt >= tenMinAgo && l.outcome === "sent").length;
    if (global10mSent >= GLOBAL_ROLLING_10M_MAX) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        outcome: "blocked_rate_limit",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "global_burst" as const };
    }

    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const globalDailyLogs = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_createdAt", q => q.gte("createdAt", oneDayAgo))
      .collect();
    const globalDailySent = globalDailyLogs.filter(l => l.outcome === "sent").length;

    if (globalDailySent >= config.smsDailyCap) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        outcome: "blocked_daily_cap",
        via: "self_service",
        createdAt: now,
      });

      const existingCapNotification = await ctx.db
        .query("staffNotifications")
        .withIndex("by_type_createdAt", q => q.eq("type", "sms_daily_cap").gte("createdAt", oneDayAgo))
        .first();

      if (!existingCapNotification) {
        await ctx.db.insert("adminLogs", {
          userId: null,
          adminName: "System",
          action: "SMS Daily Cap Reached",
          details: `Global daily SMS cap reached (${config.smsDailyCap})`,
          category: "team",
          targetType: "system",
          timestamp: now,
        });

        await ctx.db.insert("staffNotifications", {
          title: "SMS reset limit reached today",
          type: "sms_daily_cap",
          recipientRole: "ceo",
          createdAt: now,
          read: false,
        });
      }

      return { allowed: false, reason: "daily_cap_reached" as const };
    }

    const emailLogsPastHour = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_emailKey_createdAt", q => q.eq("emailKey", args.emailKey).gte("createdAt", oneHourAgo))
      .collect();

    const latestEmailLog = emailLogsPastHour[emailLogsPastHour.length - 1];
    if (latestEmailLog && now - latestEmailLog.createdAt < ACCOUNT_COOLDOWN_SECONDS * 1000) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        outcome: "blocked_rate_limit",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "cooldown" as const };
    }

    if (emailLogsPastHour.length >= ACCOUNT_HOURLY_MAX) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        outcome: "blocked_rate_limit",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "account_hourly_limit" as const };
    }

    const emailLogsPastDay = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_emailKey_createdAt", q => q.eq("emailKey", args.emailKey).gte("createdAt", oneDayAgo))
      .collect();

    if (emailLogsPastDay.length >= ACCOUNT_DAILY_MAX) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        outcome: "blocked_daily_cap",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "account_daily_limit" as const };
    }

    const staff = await ctx.db
      .query("staff")
      .withIndex("by_email", q => q.eq("email", args.normalizedEmail))
      .first();

    if (!staff || !staff.isActive) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        outcome: "no_account",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "silent_skip" as const };
    }

    if (!staff.phone) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        staffId: staff._id,
        outcome: "no_phone",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "silent_skip" as const };
    }

    const masked = maskPhone(staff.phone);

    if (!config.smsResetAllowedRoles.includes(staff.role)) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        staffId: staff._id,
        maskedPhone: masked,
        outcome: "role_not_allowed",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "silent_skip" as const };
    }

    const phoneLogsPastHour = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_maskedPhone_createdAt", q => q.eq("maskedPhone", masked).gte("createdAt", oneHourAgo))
      .collect();

    if (phoneLogsPastHour.length >= PHONE_HOURLY_MAX) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        staffId: staff._id,
        maskedPhone: masked,
        outcome: "blocked_rate_limit",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "phone_hourly_limit" as const };
    }

    const phoneLogsPastDay = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_maskedPhone_createdAt", q => q.eq("maskedPhone", masked).gte("createdAt", oneDayAgo))
      .collect();

    if (phoneLogsPastDay.length >= PHONE_DAILY_MAX) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey: args.emailKey,
        staffId: staff._id,
        maskedPhone: masked,
        outcome: "blocked_daily_cap",
        via: "self_service",
        createdAt: now,
      });
      return { allowed: false, reason: "phone_daily_limit" as const };
    }

    const earlierResets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", staff._id))
      .collect();

    for (const r of earlierResets) {
      if (!r.usedAt && !r.voidedAt) {
        await ctx.db.patch(r._id, { voidedAt: now });
      }
    }

    const resetId = await ctx.db.insert("staffPasswordResets", {
      staffId: staff._id,
      tempPasswordHash: args.tempPasswordHash,
      tempPasswordSalt: args.tempPasswordSalt,
      expiresAt: now + TEMP_PASSWORD_EXPIRES_MS,
      attempts: 0,
      createdAt: now,
      via: "self_service",
    });

    return {
      allowed: true as const,
      staffId: staff._id,
      phone: staff.phone,
      maskedPhone: masked,
      resetId,
    };
  },
});

export const completePasswordResetSend = internalMutation({
  args: {
    emailKey: v.string(),
    staffId: v.id("staff"),
    maskedPhone: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("staffSmsLog", {
      purpose: "password_reset",
      emailKey: args.emailKey,
      staffId: args.staffId,
      maskedPhone: args.maskedPhone,
      outcome: "sent",
      via: "self_service",
      createdAt: Date.now(),
    });
  },
});

export const failPasswordResetSend = internalMutation({
  args: {
    resetId: v.id("staffPasswordResets"),
    emailKey: v.string(),
    staffId: v.id("staff"),
    maskedPhone: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.resetId, { voidedAt: Date.now() });
    await ctx.db.insert("staffSmsLog", {
      purpose: "password_reset",
      emailKey: args.emailKey,
      staffId: args.staffId,
      maskedPhone: args.maskedPhone,
      outcome: "send_failed",
      via: "self_service",
      createdAt: Date.now(),
    });
  },
});

async function hashEmailKey(email: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export const prepareCeoPasswordReset = internalMutation({
  args: {
    staffToken: v.string(),
    targetStaffId: v.id("staff"),
    tempPasswordHash: v.string(),
    tempPasswordSalt: v.string(),
  },
  handler: async (ctx, args) => {
    const caller = await requireStaff(ctx, args.staffToken, { permission: "team_management" });
    if (caller.role !== "ceo") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Only the CEO may send temporary passwords by SMS." });
    }

    const target = await ctx.db.get(args.targetStaffId);
    if (!target) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Staff account not found." });
    }
    if (!target.isActive) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Cannot send temporary password to an inactive staff member." });
    }

    const settingsDoc = await ctx.db.query("staffSecuritySettings").first();
    const config = settingsDoc || DEFAULT_SMS_SETTINGS;

    if (!config.smsResetEnabled) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "SMS password reset is disabled in security settings." });
    }

    if (!target.phone) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Staff member has no phone number registered." });
    }

    if (!config.smsResetAllowedRoles.includes(target.role)) {
      throw new ConvexError({ code: "BAD_REQUEST", message: `SMS reset is not enabled for role "${target.role}".` });
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const globalDailyLogs = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_createdAt", q => q.gte("createdAt", oneDayAgo))
      .collect();
    const globalDailySent = globalDailyLogs.filter(l => l.outcome === "sent").length;

    const emailKey = await hashEmailKey(target.email);
    const masked = maskPhone(target.phone);

    if (globalDailySent >= config.smsDailyCap) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey,
        staffId: target._id,
        maskedPhone: masked,
        outcome: "blocked_daily_cap",
        via: "ceo",
        createdAt: now,
      });
      throw new ConvexError({ code: "BAD_REQUEST", message: "Daily SMS cap reached." });
    }

    // Per-target limits: 60s cooldown, max 5 per hour
    const oneHourAgo = now - 60 * 60 * 1000;
    const targetHourlyLogs = await ctx.db
      .query("staffSmsLog")
      .withIndex("by_staffId_createdAt", q => q.eq("staffId", target._id).gte("createdAt", oneHourAgo))
      .collect();

    const latestLog = targetHourlyLogs[targetHourlyLogs.length - 1];
    if (latestLog && now - latestLog.createdAt < 60 * 1000) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey,
        staffId: target._id,
        maskedPhone: masked,
        outcome: "blocked_rate_limit",
        via: "ceo",
        createdAt: now,
      });
      throw new ConvexError({ code: "RATE_LIMITED", message: "Please wait 60 seconds before sending another SMS to this staff member." });
    }

    if (targetHourlyLogs.length >= 5) {
      await ctx.db.insert("staffSmsLog", {
        purpose: "password_reset",
        emailKey,
        staffId: target._id,
        maskedPhone: masked,
        outcome: "blocked_rate_limit",
        via: "ceo",
        createdAt: now,
      });
      throw new ConvexError({ code: "RATE_LIMITED", message: "Hourly SMS limit for this staff member reached (max 5 per hour)." });
    }

    // Void earlier resets
    const earlierResets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", target._id))
      .collect();
    for (const r of earlierResets) {
      if (!r.usedAt && !r.voidedAt) {
        await ctx.db.patch(r._id, { voidedAt: now });
      }
    }

    const resetId = await ctx.db.insert("staffPasswordResets", {
      staffId: target._id,
      tempPasswordHash: args.tempPasswordHash,
      tempPasswordSalt: args.tempPasswordSalt,
      expiresAt: now + TEMP_PASSWORD_EXPIRES_MS,
      attempts: 0,
      createdAt: now,
      via: "ceo",
    });

    await ctx.db.insert("adminLogs", {
      userId: caller._id,
      adminName: caller.name,
      action: "CEO Sent SMS Password Reset",
      details: `Staff: ${target.name}; Phone: ${masked}`,
      category: "team",
      targetId: target._id,
      targetType: "staff",
      timestamp: now,
    });

    return {
      staffId: target._id,
      phone: target.phone,
      maskedPhone: masked,
      resetId,
    };
  },
});

export const completeCeoPasswordResetSend = internalMutation({
  args: {
    staffId: v.id("staff"),
    maskedPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    const emailKey = staff ? await hashEmailKey(staff.email) : "unknown";
    await ctx.db.insert("staffSmsLog", {
      purpose: "password_reset",
      emailKey,
      staffId: args.staffId,
      maskedPhone: args.maskedPhone,
      outcome: "sent",
      via: "ceo",
      createdAt: Date.now(),
    });
  },
});

export const failCeoPasswordResetSend = internalMutation({
  args: {
    resetId: v.id("staffPasswordResets"),
    staffId: v.id("staff"),
    maskedPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    const emailKey = staff ? await hashEmailKey(staff.email) : "unknown";
    await ctx.db.patch(args.resetId, { voidedAt: Date.now() });
    await ctx.db.insert("staffSmsLog", {
      purpose: "password_reset",
      emailKey,
      staffId: args.staffId,
      maskedPhone: args.maskedPhone,
      outcome: "send_failed",
      via: "ceo",
      createdAt: Date.now(),
    });
  },
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
    const target = await ctx.db.get(args.targetStaffId);
    if (!target) throw new Error("Staff account not found.");
    if (target._id === caller._id && !args.isActive) {
      throw new Error("You cannot deactivate your own CEO account.");
    }
    if (!args.isActive && target.role === "ceo" && target.isActive && await getActiveCeoCount(ctx) <= 1) {
      throw new Error("The system must keep at least one active CEO.");
    }
    await ctx.db.patch(args.targetStaffId, { isActive: args.isActive });

    if (!args.isActive) {
      // Revoke all sessions if deactivated
      const sessions = await ctx.db.query("staffSessions").withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId)).collect();
      for (const session of sessions) {
        if (!session.revokedAt) {
          await ctx.db.patch(session._id, { revokedAt: Date.now() });
        }
      }

      // Void any pending temp resets
      const resets = await ctx.db
        .query("staffPasswordResets")
        .withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId))
        .collect();
      for (const r of resets) {
        if (!r.usedAt && !r.voidedAt) {
          await ctx.db.patch(r._id, { voidedAt: Date.now() });
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
    if (!(VALID_STAFF_ROLES as readonly string[]).includes(args.role)) {
      throw new Error("Role must be ceo, admin, designer, or sales.");
    }
    const target = await ctx.db.get(args.targetStaffId);
    if (!target) throw new Error("Staff account not found.");
    if (target._id === caller._id && args.role !== "ceo") {
      throw new Error("You cannot demote your own CEO account.");
    }
    if (target.role === "ceo" && target.isActive && args.role !== "ceo" && await getActiveCeoCount(ctx) <= 1) {
      throw new Error("The system must keep at least one active CEO.");
    }
    await ctx.db.patch(args.targetStaffId, { role: args.role });

    // Void pending temp resets on role change
    const resets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", args.targetStaffId))
      .collect();
    for (const r of resets) {
      if (!r.usedAt && !r.voidedAt) {
        await ctx.db.patch(r._id, { voidedAt: Date.now() });
      }
    }

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

export const getActiveTempReset = internalQuery({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const resets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", args.staffId))
      .collect();

    return resets.find(
      r => !r.usedAt && !r.voidedAt && r.expiresAt > now && r.attempts < 5
    ) || null;
  },
});

export const consumeTempPassword = internalMutation({
  args: { resetId: v.id("staffPasswordResets"), staffId: v.id("staff") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.resetId, { usedAt: Date.now() });
    await ctx.db.patch(args.staffId, { mustChangePassword: true, failedAttempts: 0, lockedUntil: undefined });
  },
});

export const recordTempPasswordFailure = internalMutation({
  args: { resetId: v.id("staffPasswordResets") },
  handler: async (ctx, args) => {
    const reset = await ctx.db.get(args.resetId);
    if (!reset) return;
    const newAttempts = reset.attempts + 1;
    const updates: Record<string, any> = { attempts: newAttempts };
    if (newAttempts >= 5) {
      updates.voidedAt = Date.now();
    }
    await ctx.db.patch(reset._id, updates);
  },
});

export const getRecentTempPasswordHashes = internalQuery({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const resets = await ctx.db
      .query("staffPasswordResets")
      .withIndex("by_staffId", q => q.eq("staffId", args.staffId))
      .order("desc")
      .take(10);
    return resets.map(r => r.tempPasswordHash);
  },
});



