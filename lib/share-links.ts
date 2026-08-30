import crypto from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const SECRET = process.env.JWT_SECRET;

function sign(id: string, purpose: string): string {
  return crypto.createHmac('sha256', SECRET).update(`${purpose}:${id}`).digest('hex').slice(0, 32);
}

/** Token for the public, no-login invoice page — anyone with the link (and the order id) can view it. */
export function signInvoiceToken(orderId: string): string {
  return sign(orderId, 'invoice');
}

export function verifyInvoiceToken(orderId: string, token: string): boolean {
  if (!token) return false;
  const expected = sign(orderId, 'invoice');
  // Constant-time compare to avoid timing attacks on the token check.
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
