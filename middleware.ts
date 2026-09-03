import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const TOKEN_NAME = 'reseller_bus_session';

// Simple Rate Limiting Map
const ipRateLimits = new Map<string, { count: number; timestamp: number }>();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // 1. Add Security Response Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;"
  );

  // 2. Rate Limiting for Auth Endpoints (includes 2FA — a 6-digit code is brute-forceable otherwise)
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/2fa')
  ) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const limitRecord = ipRateLimits.get(ip) || { count: 0, timestamp: now };

    if (now - limitRecord.timestamp > 60000) {
      limitRecord.count = 1;
      limitRecord.timestamp = now;
    } else {
      limitRecord.count += 1;
    }

    ipRateLimits.set(ip, limitRecord);

    if (limitRecord.count > 10) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again in 1 minute.' },
        { status: 429 }
      );
    }
  }

  // 3. Admin & User Route Protection
  const token = req.cookies.get(TOKEN_NAME)?.value;
  let decodedPayload: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decodedPayload = payload;
    } catch (e) {
      decodedPayload = null;
    }
  }

  // Protect Admin UI (/admin/*) & Admin API (/api/admin/*)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!decodedPayload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth/login?redirect=' + encodeURIComponent(pathname), req.url));
    }

    const role = decodedPayload.role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'STAFF') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/?error=forbidden', req.url));
    }
  }

  // Protect Account Portal (/account/*)
  if (pathname.startsWith('/account')) {
    if (!decodedPayload) {
      return NextResponse.redirect(new URL('/auth/login?redirect=/account', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*', '/api/auth/:path*'],
};
