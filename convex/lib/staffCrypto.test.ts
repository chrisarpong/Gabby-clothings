// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { 
  hashPassword, 
  verifyPassword, 
  dummyVerifyPassword, 
  validatePasswordPolicy, 
  generateTempPassword, 
  encryptTotpSecret, 
  decryptTotpSecret, 
  generateRecoveryCodes, 
  verifyRecoveryCode, 
  verifyTOTP 
} from './staffCrypto';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';

describe('staffCrypto', () => {
  beforeAll(() => {
    process.env.STAFF_2FA_ENC_KEY = crypto.randomBytes(32).toString('base64');
  });

  it('scrypt round trip and wrong password', async () => {
    const pass = 'superSecret123!';
    const salt = crypto.randomBytes(16).toString('hex');
    const hashStr = await hashPassword(pass, salt, { N: 1024, r: 8, p: 1, keylen: 64, maxmem: 64*1024*1024 }); // Use smaller N for faster tests
    
    expect(await verifyPassword(pass, hashStr)).toBe(true);
    expect(await verifyPassword('wrongpass', hashStr)).toBe(false);
  });

  it('dummyVerifyPassword takes roughly same time (fake test just to ensure no throw)', async () => {
    expect(await dummyVerifyPassword('anything')).toBe(false);
  });

  it('password policy enforcement', () => {
    expect(() => validatePasswordPolicy('short', 'admin@x.com', 'Admin')).toThrow('Password must be at least 12 characters');
    expect(() => validatePasswordPolicy('admin@x.com12345', 'admin@x.com', 'Admin')).toThrow('Password cannot contain your email');
    expect(() => validatePasswordPolicy('AdminPassword123', 'foo@x.com', 'John Admin')).toThrow('Password cannot contain your name');
    expect(() => validatePasswordPolicy('password12345', 'foo@x.com', 'Admin')).toThrow('Password is too common');
    expect(() => validatePasswordPolicy('AmazingSecurePass2025!', 'foo@x.com', 'Admin')).not.toThrow();
  });

  it('temp password charset and generation', () => {
    const tp = generateTempPassword();
    expect(tp.length).toBe(16);
    expect(/[a-z]/.test(tp)).toBe(true);
    expect(/[A-Z]/.test(tp)).toBe(true);
    expect(/[0-9]/.test(tp)).toBe(true);
    expect(/[!@#$%^&*]/.test(tp)).toBe(true);
    expect(/[0O1lI]/.test(tp)).toBe(false);
  });

  it('TOTP correct code, wrong fails, replayed code fails', () => {
    const secret = authenticator.generateSecret();
    const token = authenticator.generate(secret);
    
    const res1 = verifyTOTP(token, secret, 0);
    expect(res1.valid).toBe(true);
    
    // Replay with the same step should fail
    const res2 = verifyTOTP(token, secret, res1.step);
    expect(res2.valid).toBe(false);
    
    // Wrong token
    expect(verifyTOTP('000000', secret, 0).valid).toBe(false);
  });

  it('AES-GCM round trip and tamper detection', () => {
    const secret = 'my-totp-secret';
    const envKey = process.env.STAFF_2FA_ENC_KEY!;
    
    const enc = encryptTotpSecret(secret, envKey);
    expect(decryptTotpSecret(enc, envKey)).toBe(secret);
    
    // Tamper
    const parts = enc.split(':');
    parts[2] = (parts[2].startsWith('A') ? 'B' : 'A') + parts[2].substring(1); // alter ciphertext
    expect(() => decryptTotpSecret(parts.join(':'), envKey)).toThrow();
  });

  it('recovery code single use', () => {
    const { plain, hashed } = generateRecoveryCodes();
    
    // Use first code
    const res1 = verifyRecoveryCode(plain[0], hashed);
    expect(res1.valid).toBe(true);
    
    // Reuse should fail
    const res2 = verifyRecoveryCode(plain[0], res1.remainingHashed);
    expect(res2.valid).toBe(false);
  });
});
