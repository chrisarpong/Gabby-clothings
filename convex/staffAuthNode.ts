"use node";
import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { verifyPassword, dummyVerifyPassword, hashPassword, validatePasswordPolicy } from "./lib/staffCrypto";
import * as crypto from 'crypto';
import { authenticator } from 'otplib';

export const loginAction = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch user by email via internal query
    const staff = await ctx.runQuery(internal.staffAuth.getStaffForLogin, { email: args.email });
    
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
      await ctx.runMutation(internal.staffAuth.recordFailedLogin, { staffId: staff._id });
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid email or password" });
    }

    // 3. (Reset failed logins is handled within getStaffForLogin / recordFailedLogin indirectly or explicitly if added)
    // For now we assume a successful login resets it (actually, we should add a resetFailedLogins to staffAuth.ts if needed. Let's just patch it inline)
    await ctx.runMutation(internal.staffAuth.recordFailedLogin, { staffId: staff._id, reset: true });

    // 4. Check if 2FA is required
    if (staff.totpEnabled) {
      // Return a challenge token instead of a session token
      const challengeToken = crypto.randomBytes(32).toString('hex');
      await ctx.runMutation(internal.staffAuth.createChallenge, { 
        staffId: staff._id, 
        tokenHash: crypto.subtle.digest ? (await (async () => {
          const encoder = new TextEncoder();
          const hb = await crypto.subtle.digest("SHA-256", encoder.encode(challengeToken));
          return Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2, '0')).join('');
        })()) : challengeToken,
        purpose: "2fa"
      });
      return { status: "2fa_required", token: challengeToken };
    }

    // 5. Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

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
    const { staff, session } = await ctx.runQuery(internal.staffAuth.validateSession, { token: args.staffToken });
    
    // 2. Validate password policy
    // We need email and name, which we have in staff
    validatePasswordPolicy(args.newPassword, staff.email, staff.name);

    // 3. Hash new password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashPassword(args.newPassword, salt);

    // 4. Update password and revoke all other sessions
    await ctx.runMutation(internal.staffAuth.updatePassword, {
      staffId: staff._id,
      passwordHash: hash,
      passwordSalt: salt,
      currentSessionId: session._id,
    });

    return { status: "success", token: args.staffToken };
  }
});

export const setup2FA = action({
  args: {
    staffToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { staff } = await ctx.runQuery(internal.staffAuth.validateSession, { token: args.staffToken });
    
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(staff.email, "Gabby Newluk", secret);

    await ctx.runMutation(internal.staffAuth.updateStaffTotpSecret, {
      staffId: staff._id,
      secret: secret
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
  handler: async (ctx, args) => {
    let secret = "";
    let staffId = null;

    if (args.isSetup) {
      const { staff } = await ctx.runQuery(internal.staffAuth.validateSession, { token: args.token });
      secret = staff.totpSecret || "";
      staffId = staff._id;
    } else {
      const encoder = new TextEncoder();
      const hb = await crypto.subtle.digest("SHA-256", encoder.encode(args.token));
      const hash = Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const challenge = await ctx.runQuery(internal.staffAuth.getChallenge, { tokenHash: hash, purpose: "2fa" });
      if (!challenge) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid or expired challenge" });
      
      const isBurned = await ctx.runMutation(internal.staffAuth.incrementChallengeAttempts, { challengeId: challenge._id });
      if (isBurned) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Too many attempts" });

      const staff = await ctx.runQuery(internal.staffAuth.getStaffById, { staffId: challenge.staffId });
      if (!staff || !staff.totpEnabled) throw new ConvexError({ code: "UNAUTHENTICATED", message: "2FA not configured" });

      secret = staff.totpSecret || "";
      staffId = staff._id;
      
      const isValid = authenticator.check(args.code, secret);
      if (!isValid) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid 2FA code" });
      
      await ctx.runMutation(internal.staffAuth.consumeChallenge, { challengeId: challenge._id });
      
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const sb = await crypto.subtle.digest("SHA-256", encoder.encode(sessionToken));
      const sessionHash = Array.from(new Uint8Array(sb)).map(b => b.toString(16).padStart(2, '0')).join('');

      await ctx.runMutation(internal.staffAuth.createSession, {
        staffId: staff._id,
        tokenHash: sessionHash,
        ip: "unknown",
        userAgent: "unknown"
      });

      return { status: "success", token: sessionToken };
    }

    const isValid = authenticator.check(args.code, secret);
    if (!isValid) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Invalid 2FA code" });

    if (args.isSetup) {
      // Actually enable it
      await ctx.runMutation(internal.staffAuth.enableStaff2FAInternal, { staffId: staffId });
      return { status: "success", token: args.token };
    }
  }
});
