import * as crypto from 'crypto';
import { authenticator } from 'otplib';

// Configure otplib for 30s, 6 digits
authenticator.options = { window: 1 };

export const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 };
const DUMMY_HASH_CACHE = { hash: '', salt: '' };

export async function hashPassword(password: string, salt: string, params = SCRYPT_PARAMS): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, params.keylen, { N: params.N, r: params.r, p: params.p, maxmem: params.maxmem }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`scrypt$${params.N}$${params.r}$${params.p}$${salt}$${derivedKey.toString('base64')}`);
    });
  });
}

export async function verifyPassword(password: string, storedHashStr: string): Promise<boolean> {
  const parts = storedHashStr.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false; // Invalid format
  }
  const N = parseInt(parts[1], 10);
  const r = parseInt(parts[2], 10);
  const p = parseInt(parts[3], 10);
  const salt = parts[4];
  const hash = parts[5];
  
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  
  const expectedHash = Buffer.from(hash, 'base64');
  if (derivedKey.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(derivedKey, expectedHash);
}

export async function dummyVerifyPassword(password: string): Promise<boolean> {
  if (!DUMMY_HASH_CACHE.hash) {
    DUMMY_HASH_CACHE.salt = crypto.randomBytes(16).toString('hex');
    DUMMY_HASH_CACHE.hash = await hashPassword('dummy_password_never_matches', DUMMY_HASH_CACHE.salt);
  }
  await verifyPassword(password, DUMMY_HASH_CACHE.hash);
  return false;
}

export function validatePasswordPolicy(password: string, email: string, name: string, oldPassword?: string, tempPassword?: string) {
  if (password.length < 12) throw new Error("Password must be at least 12 characters");
  if (oldPassword && password === oldPassword) throw new Error("New password cannot be the same as the old password");
  if (tempPassword && password === tempPassword) throw new Error("New password cannot be the same as the temporary password");
  
  const emailLocal = email.split('@')[0].toLowerCase();
  const passLower = password.toLowerCase();
  if (passLower.includes(emailLocal)) throw new Error("Password cannot contain your email");
  
  const nameParts = name.toLowerCase().split(/\s+/);
  for (const part of nameParts) {
    if (part.length > 3 && passLower.includes(part)) throw new Error("Password cannot contain your name");
  }
  
  const blocklist = ['password123', 'qwerty', 'admin123', 'gabbynewluk'];
  for (const block of blocklist) {
    if (passLower.includes(block)) throw new Error("Password is too common");
  }
}

export function generateTempPassword(): string {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*'; // no 0O1lI
  let pass = '';
  while (true) {
    pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars[crypto.randomInt(0, chars.length)];
    }
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[!@#$%^&*]/.test(pass)) {
      break;
    }
  }
  return pass;
}

export function encryptTotpSecret(secret: string, envKeyBase64: string): string {
  if (!envKeyBase64) throw new Error("STAFF_2FA_ENC_KEY missing");
  const key = Buffer.from(envKeyBase64, 'base64');
  if (key.length !== 32) throw new Error("STAFF_2FA_ENC_KEY must be 32 bytes");
  
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptTotpSecret(encryptedString: string, envKeyBase64: string): string {
  if (!envKeyBase64) throw new Error("STAFF_2FA_ENC_KEY missing");
  const key = Buffer.from(envKeyBase64, 'base64');
  const parts = encryptedString.split(':');
  if (parts.length !== 3) throw new Error("Invalid encrypted format");
  
  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = Buffer.from(parts[2], 'base64');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function generateRecoveryCodes(): { plain: string[], hashed: string } {
  const codes: string[] = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // base32
  for (let i = 0; i < 10; i++) {
    let c = '';
    for (let j = 0; j < 10; j++) c += chars[crypto.randomInt(0, chars.length)];
    codes.push(`${c.slice(0, 5)}-${c.slice(5)}`);
  }
  
  const envKey = process.env.STAFF_2FA_ENC_KEY || '';
  if (!envKey) throw new Error("STAFF_2FA_ENC_KEY missing for recovery codes");
  const key = Buffer.from(envKey, 'base64');
  
  const hashed = codes.map(c => crypto.createHmac('sha256', key).update(c).digest('hex')).join(',');
  return { plain: codes, hashed };
}

export function verifyRecoveryCode(code: string, hashedCodesStr: string): { valid: boolean, remainingHashed: string } {
  const envKey = process.env.STAFF_2FA_ENC_KEY || '';
  if (!envKey) throw new Error("STAFF_2FA_ENC_KEY missing");
  const key = Buffer.from(envKey, 'base64');
  
  const codeHash = crypto.createHmac('sha256', key).update(code.toUpperCase()).digest('hex');
  const codes = hashedCodesStr.split(',');
  
  const index = codes.indexOf(codeHash);
  if (index !== -1) {
    codes.splice(index, 1);
    return { valid: true, remainingHashed: codes.join(',') };
  }
  return { valid: false, remainingHashed: hashedCodesStr };
}

export function verifyTOTP(token: string, secret: string, lastUsedStep: number = 0): { valid: boolean, step: number } {
  try {
    // We can't strictly get the step from otplib's verify without tracking time manually, but otplib does provide it if we do step check.
    // However, otplib's authenticator.verify just checks if it's valid now or in window.
    // To prevent replay, we need the window step.
    const isValid = authenticator.verify({ token, secret });
    if (!isValid) return { valid: false, step: 0 };
    
    // Generate the step from current time to track replay
    const currentStep = Math.floor(Date.now() / 30000);
    if (currentStep <= lastUsedStep) {
      // Trying to reuse a token in the same window (or older)
      // otplib options.window = 1 means it accepts current, -1, +1.
      // We must actually check which step the token matches.
      
      const checkCurrent = authenticator.check(token, secret);
      // It's tricky to get the exact step matched from otplib. 
      // Instead, we just require currentStep > lastUsedStep (if it matched current)
      // Actually otplib `authenticator.checkDelta` returns the delta.
      const delta = authenticator.checkDelta(token, secret);
      if (delta === null) return { valid: false, step: 0 };
      
      const matchedStep = currentStep + delta;
      if (matchedStep <= lastUsedStep) {
         return { valid: false, step: 0 }; // Replayed
      }
      return { valid: true, step: matchedStep };
    }
    
    const delta = authenticator.checkDelta(token, secret);
    const matchedStep = delta !== null ? currentStep + delta : currentStep;
    return { valid: true, step: matchedStep };
  } catch (e) {
    return { valid: false, step: 0 };
  }
}
