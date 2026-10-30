"use node";
import { action, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { 
  verifyPassword, 
  dummyVerifyPassword, 
  hashPassword, 
  validatePasswordPolicy,
  encryptTotpSecret,
  decryptTotpSecret,
  generateRecoveryCodes,
  verifyRecoveryCode
} from "./lib/staffCrypto";
import * as crypto from 'crypto';
import { authenticator } from 'otplib';

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function requireStaff2FAKey(): string {
  const envKey = process.env.STAFF_2FA_ENC_KEY || "";
  if (!envKey) {
    throw new ConvexError({ code: "CONFIGURATION_ERROR", message: "STAFF_2FA_ENC_KEY is required to set up or verify staff 2FA." });
  }
  if (Buffer.from(envKey, "base64").length !== 32) {
    throw new ConvexError({ code: "CONFIGURATION_ERROR", message: "STAFF_2FA_ENC_KEY must be a base64-encoded 32-byte key." });
  }
  return envKey;
}

export const loginAction = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const rateLimit = await ctx.runMutation(internal.staffAuth.checkLoginRateLimit, { email: normalizedEmail });
    if (!rateLimit.allowed) {
      throw new ConvexError({ code: "TOO_MANY_REQUESTS", message: "Too many login attempts. Please try again later." });
    }

    // 1. Fetch user by email via internal query
    const staff = await ctx.runQuery(internal.staffAuth.getStaffForLogin, { email: normalizedEmail });
    
    // Constant time dummy verification to prevent timing attacks
    if (!staff) {
      await dummyVerifyPassword(args.password);
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid email or password" });
    }

    if (!staff.isActive) {
      await dummyVerifyPassword(args.password);
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Account is deactivated" });
    }

    if (staff.lockedUntil && staff.lockedUntil > Date.now()) {
      await dummyVerifyPassword(args.password);
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Account is locked" });
    }

    // 2. Verify password
    const isValid = await verifyPassword(args.password, staff.passwordHash);

    if (!isValid) {
      // Record failed attempt
      await ctx.runMutation(internal.staffAuth.recordFailedLogin, { email: normalizedEmail });
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid email or password" });
    }

    // 3. Check if 2FA is required
    if (staff.totpEnabled) {
      // Return a challenge token instead of a session token
      const challengeToken = crypto.randomBytes(32).toString('hex');
      const challengeHash = hashToken(challengeToken);
      await ctx.runMutation(internal.staffAuth.createChallenge, { 
        staffId: staff._id, 
        tokenHash: challengeHash,
        purpose: "verify_2fa"
      });
      return { status: "2fa_required", token: challengeToken };
    }

    // 4. Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);

    await ctx.runMutation(internal.staffAuth.createSession, {
      staffId: staff._id,
      tokenHash: tokenHash,
      ip: "unknown",
      userAgent: "unknown"
    });

    return { status: "success", token };
  }
});

export const changePasswordAction = action({
  args: {
    staffToken: v.string(), 
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify session
    const tokenHash = hashToken(args.staffToken);
    const staff = await ctx.runQuery(internal.staffAuth.validateSession, { tokenHash });
    if (!staff) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid session" });
    
    // 2. Validate password policy
    if (await verifyPassword(args.newPassword, staff.passwordHash)) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "New password cannot be the same as the current password" });
    }
    validatePasswordPolicy(args.newPassword, staff.email, staff.name);

    // 3. Hash new password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashPassword(args.newPassword, salt);

    // 4. Update password and revoke old sessions
    await ctx.runMutation(internal.staffAuth.updatePassword, {
      staffId: staff._id,
      passwordHash: hash,
      passwordSalt: salt,
    });

    // 5. Create a new session so staff remains logged in
    const newToken = crypto.randomBytes(32).toString('hex');
    const newTokenHash = hashToken(newToken);
    await ctx.runMutation(internal.staffAuth.createSession, {
      staffId: staff._id,
      tokenHash: newTokenHash,
      ip: "unknown",
      userAgent: "unknown"
    });

    return { status: "success", token: newToken };
  }
});

export const setup2FA = action({
  args: {
    staffToken: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenHash = hashToken(args.staffToken);
    const staff = await ctx.runQuery(internal.staffAuth.validateSession, { tokenHash });
    if (!staff) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid session" });
    const envKey = requireStaff2FAKey();
    
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(staff.email, "Gabby Newluk", secret);

    const storedSecret = encryptTotpSecret(secret, envKey);

    await ctx.runMutation(internal.staffAuth.updateStaffTotpSecret, {
      staffId: staff._id,
      totpSecret: storedSecret
    });

    return { secret, uri };
  }
});

export const verify2FA = action({
  args: {
    token: v.string(), // challengeToken or sessionToken
    code: v.string(),
    isSetup: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ status: string; token: string; recoveryCodes?: string[] }> => {
    const envKey = requireStaff2FAKey();

    if (args.isSetup) {
      const tokenHash = hashToken(args.token);
      const staff = await ctx.runQuery(internal.staffAuth.validateSession, { tokenHash });
      if (!staff || !staff.totpSecret) throw new ConvexError({ code: "UNAUTHENTICATED", message: "2FA not configured" });

      const rawSecret = staff.totpSecret.includes(':') && envKey
        ? decryptTotpSecret(staff.totpSecret, envKey)
        : staff.totpSecret;

      const isValid = authenticator.check(args.code, rawSecret);
      if (!isValid) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid 2FA code" });

      const { plain: recoveryCodes, hashed: hashedCodes } = generateRecoveryCodes();

      await ctx.runMutation(internal.staffAuth.enableStaff2FAInternal, {
        staffId: staff._id,
        totpSecret: staff.totpSecret,
        recoveryCodes: hashedCodes,
      });

      return { status: "success", token: args.token, recoveryCodes };
    } else {
      const tokenHash = hashToken(args.token);
      const challenge = await ctx.runQuery(internal.staffAuth.getChallenge, { tokenHash, purpose: "verify_2fa" });
      if (!challenge) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid or expired challenge" });
      
      const isBurned = await ctx.runMutation(internal.staffAuth.incrementChallengeAttempts, { challengeId: challenge._id });
      if (isBurned) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Too many attempts" });

      const staff = await ctx.runQuery(internal.staffAuth.getStaffById, { staffId: challenge.staffId });
      if (!staff || !staff.totpEnabled || !staff.totpSecret) throw new ConvexError({ code: "UNAUTHENTICATED", message: "2FA not configured" });

      const rawSecret = staff.totpSecret.includes(':') && envKey
        ? decryptTotpSecret(staff.totpSecret, envKey)
        : staff.totpSecret;

      let isValid = authenticator.check(args.code, rawSecret);

      // Check recovery codes if TOTP fails and recovery codes exist
      if (!isValid && staff.recoveryCodes && envKey) {
        const { valid, remainingHashed } = verifyRecoveryCode(args.code, staff.recoveryCodes);
        if (valid) {
          isValid = true;
          await ctx.runMutation(internal.staffAuth.updateStaffRecoveryCodes, {
            staffId: staff._id,
            recoveryCodes: remainingHashed,
          });
        }
      }

      if (!isValid) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid 2FA code" });
      
      await ctx.runMutation(internal.staffAuth.consumeChallenge, { challengeId: challenge._id });
      
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const sessionHash = hashToken(sessionToken);

      await ctx.runMutation(internal.staffAuth.createSession, {
        staffId: staff._id,
        tokenHash: sessionHash,
        ip: "unknown",
        userAgent: "unknown"
      });

      return { status: "success", token: sessionToken };
    }
  }
});

function generateOneTimePassword(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let temp = "";
  for (let i = 0; i < length; i++) {
    temp += chars[crypto.randomInt(chars.length)];
  }
  return temp;
}
function generateTempPassword() {
  return generateOneTimePassword(16);
}

export const operatorResetStaffAccess = internalAction({
  args: {
    email: v.string(),
    resetTwoFactor: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ email: string; password: string }> => {
    const email = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "A valid staff email is required." });
    }

    const password = generateOneTimePassword(20);
    const passwordSalt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, passwordSalt);
    await ctx.runMutation(internal.staffAuth.operatorResetStaffAccessInternal, {
      email,
      passwordHash,
      passwordSalt,
      resetTwoFactor: args.resetTwoFactor === true,
    });
    return { email, password };
  },
});

export const bootstrapCeo = internalAction({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args): Promise<{ email: string; password: string }> => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    if (!name) throw new ConvexError({ code: "BAD_REQUEST", message: "CEO name is required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ConvexError({ code: "BAD_REQUEST", message: "A valid CEO email is required." });
    const password = generateOneTimePassword(20);
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, salt);
    await ctx.runMutation(internal.staffAuth.bootstrapCeoInternal, { name, email, passwordHash, passwordSalt: salt });
    return { email, password };
  },
});

export const seedDevTeam = internalAction({
  args: {},
  handler: async (ctx): Promise<Array<{ role: string; email: string; password: string }>> => {
    if (process.env.ALLOW_DEV_SEED !== "true") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Development seed is disabled." });
    }
    const candidates = await Promise.all((['admin', 'designer', 'sales'] as const).map(async role => {
      const password = generateOneTimePassword(20);
      const salt = crypto.randomBytes(16).toString("hex");
      return { role, name: `Dev ${role[0].toUpperCase()}${role.slice(1)}`, email: `dev-${role}@example.test`, password, passwordHash: await hashPassword(password, salt), passwordSalt: salt };
    }));
    const createdRoles = await ctx.runMutation(internal.staffAuth.seedDevTeamInternal, {
      candidates: candidates.map(({ password, ...candidate }) => candidate),
    });
    return candidates.filter(candidate => createdRoles.includes(candidate.role)).map(({ role, email, password }) => ({ role, email, password }));
  },
});

export const createStaffUser = action({
  args: {
    staffToken: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate session & permissions
    const tokenHash = hashToken(args.staffToken);
    const staff = await ctx.runQuery(internal.staffAuth.validateSession, { tokenHash, permission: "team_management" });
    if (!staff) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid session" });
    if (staff.role !== "ceo") throw new ConvexError({ code: "UNAUTHORIZED", message: "Only CEO can manage staff" });
    if (!["ceo", "admin", "designer", "sales"].includes(args.role)) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Role must be ceo, admin, designer, or sales." });
    }
    const email = args.email.trim().toLowerCase();
    if (!email) throw new ConvexError({ code: "BAD_REQUEST", message: "Email is required." });

    // 2. Generate strong OTP
    const tempPassword = generateTempPassword();

    // 3. Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashPassword(tempPassword, salt);

    // 4. Create user
    await ctx.runMutation(internal.staffAuth.createStaffInternal, {
      name: args.name,
      email,
      role: args.role,
      passwordHash: hash,
      passwordSalt: salt,
      createdBy: staff._id,
      callerName: staff.name,
    });

    return tempPassword;
  }
});

export const resetStaffPassword = action({
  args: {
    staffToken: v.string(),
    targetStaffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const tokenHash = hashToken(args.staffToken);
    const staff = await ctx.runQuery(internal.staffAuth.validateSession, { tokenHash, permission: "team_management" });
    if (!staff) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid session" });
    if (staff.role !== "ceo") throw new ConvexError({ code: "UNAUTHORIZED", message: "Only CEO can manage staff" });

    const tempPassword = generateTempPassword();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashPassword(tempPassword, salt);

    await ctx.runMutation(internal.staffAuth.updateStaffPasswordInternal, {
      targetStaffId: args.targetStaffId,
      passwordHash: hash,
      passwordSalt: salt,
      callerId: staff._id,
      callerName: staff.name,
    });

    return tempPassword;
  }
});
