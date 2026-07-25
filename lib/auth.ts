import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'reseller-bus-super-secret-jwt-key-2026';
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
