import { NextResponse } from 'next/server';
import { AuthService } from './auth.service';
import { setSessionCookie, clearSessionCookie, getSessionUser } from '@/lib/auth';

function toPublicUser(user: { id: string; firstName: string; lastName: string; email: string; role: string }) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}

export class AuthController {
  static async register(req: Request) {
    try {
      const body = await req.json();
      const { user, token } = await AuthService.register(body);
      setSessionCookie(token);

      return NextResponse.json({ success: true, user: toPublicUser(user) });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
    }
  }

  static async login(req: Request) {
    try {
      const { email, password } = await req.json();
      const result = await AuthService.login(email, password);

      if (result.status === 'requires_setup') {
        return NextResponse.json({
          requiresSetup: true,
          pendingToken: result.pendingToken,
          qrDataUrl: result.qrDataUrl,
          secretForManualEntry: result.secretForManualEntry,
        });
      }

      if (result.status === 'requires_2fa') {
        return NextResponse.json({ requires2FA: true, pendingToken: result.pendingToken });
      }

      setSessionCookie(result.token);
      return NextResponse.json({ success: true, user: toPublicUser(result.user) });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
    }
  }

  static async confirm2FASetup(req: Request) {
    try {
      const { pendingToken, code } = await req.json();
      const { user, token, backupCodes } = await AuthService.confirm2FASetup(pendingToken, code);
      setSessionCookie(token);
      return NextResponse.json({ success: true, user: toPublicUser(user), backupCodes });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to enable 2FA' }, { status: 400 });
    }
  }

  static async verify2FA(req: Request) {
    try {
      const { pendingToken, code } = await req.json();
      const { user, token, usedBackupCode } = await AuthService.verify2FA(pendingToken, code);
      setSessionCookie(token);
      return NextResponse.json({ success: true, user: toPublicUser(user), usedBackupCode });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Invalid code' }, { status: 400 });
    }
  }

  static async logout() {
    clearSessionCookie();
    return NextResponse.json({ success: true });
  }

  static async me() {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: session });
  }

  static async resetPassword(req: Request) {
    try {
      const session = await getSessionUser();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const { newPassword } = await req.json();
      await AuthService.resetPassword(session.userId, newPassword);

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
