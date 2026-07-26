import { NextResponse } from 'next/server';
import { AuthService } from './auth.service';
import { setSessionCookie, clearSessionCookie, getSessionUser } from '@/lib/auth';

export class AuthController {
  static async register(req: Request) {
    try {
      const body = await req.json();
      const { user, token } = await AuthService.register(body);
      setSessionCookie(token);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
    }
  }

  static async login(req: Request) {
    try {
      const { email, password } = await req.json();
      const { user, token } = await AuthService.login(email, password);
      setSessionCookie(token);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
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
