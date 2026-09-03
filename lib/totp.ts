import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { hashPassword, comparePassword } from './auth';

const ISSUER = 'Reseller Bus Admin';

export function generateSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function buildTotp(secret: string, label: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/** Renders the enrollment QR as a data: URL PNG — the secret never leaves the server otherwise. */
export async function buildQrDataUrl(secret: string, label: string): Promise<string> {
  const totp = buildTotp(secret, label);
  return QRCode.toDataURL(totp.toString());
}

/** Verifies a 6-digit code, allowing ±1 time-step (30s) of clock drift. */
export function verifyTotpCode(secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const totp = buildTotp(secret, 'account');
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

/** Generates 8 human-friendly single-use recovery codes (plaintext for one-time display + bcrypt hashes for storage). */
export async function generateBackupCodes(): Promise<{ plaintext: string[]; hashed: string[] }> {
  const plaintext = Array.from({ length: 8 }, () =>
    crypto.randomBytes(5).toString('hex').toUpperCase().match(/.{1,5}/g)!.join('-')
  );
  const hashed = await Promise.all(plaintext.map((code) => hashPassword(code)));
  return { plaintext, hashed };
}

/**
 * Checks `code` against a JSON-encoded list of hashed backup codes. Returns the updated
 * (consumed) list on success, or null if the code didn't match anything.
 */
export async function consumeBackupCode(hashedListJson: string | null, code: string): Promise<string[] | null> {
  if (!hashedListJson) return null;
  const hashedList: string[] = JSON.parse(hashedListJson);
  const normalized = code.trim().toUpperCase();

  for (let i = 0; i < hashedList.length; i++) {
    if (await comparePassword(normalized, hashedList[i])) {
      return [...hashedList.slice(0, i), ...hashedList.slice(i + 1)];
    }
  }
  return null;
}
