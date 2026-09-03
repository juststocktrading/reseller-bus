import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = 'reseller_bus_session';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export type PendingAuthPurpose = 'login_2fa' | 'setup_2fa';

interface PendingAuthPayload {
  userId: string;
  purpose: PendingAuthPurpose;
}

/**
 * Short-lived token used between password verification and 2FA verification. Returned in the
 * JSON response body only (never set as a cookie) so it alone can never create a session —
 * the matching TOTP code is still required.
 */
export function generatePendingToken(payload: PendingAuthPayload, expiresIn: jwt.SignOptions['expiresIn'] = '5m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyPendingToken(token: string, expectedPurpose: PendingAuthPurpose): PendingAuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PendingAuthPayload;
    if (decoded.purpose !== expectedPurpose) return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Check if user is suspended in DB
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { isSuspended: true, role: true }
  });

  if (!user || user.isSuspended) return null;

  return { ...decoded, role: user.role };
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function generateResetCode(userId: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({
    where: { id: userId },
    data: { resetCode: code },
  });
  return code;
}
