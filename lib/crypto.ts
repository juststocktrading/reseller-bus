import crypto from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Derive a stable 32-byte AES-256 key from the existing JWT_SECRET so no new
// required env var is needed to store sensitive admin-entered credentials
// (e.g. the Stripe secret key) at rest in the database.
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.JWT_SECRET).digest();
const IV_LENGTH = 12; // recommended IV length for GCM
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a plaintext string for storage. Output format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':');
}

/**
 * Decrypts a string produced by encrypt(). Throws if the payload is malformed or tampered with.
 */
export function decrypt(payload: string): string {
  const [ivB64, authTagB64, ciphertextB64] = payload.split(':');
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('Malformed encrypted payload');
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, 'base64')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}

/**
 * Masks a secret key for display in the admin UI, e.g. "sk_live_••••••••3f2a" -> keeps a
 * recognizable prefix + last 4 characters, hides everything else.
 */
export function maskSecret(key: string): string {
  if (!key) return '';
  const prefixMatch = key.match(/^([a-zA-Z]+_(?:live|test)_)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const last4 = key.slice(-4);
  return `${prefix}${'•'.repeat(8)}${last4}`;
}
