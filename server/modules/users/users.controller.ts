import { NextResponse } from 'next/server';
import { UsersService } from './users.service';
import { getSessionUser } from '@/lib/auth';

export class UsersController {
  static async getAllUsers() {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const users = await UsersService.getAllUsers();
      return NextResponse.json({ users });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  static async createUser(req: Request) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only Super Admin can create staff or admin accounts' }, { status: 403 });
      }

      const body = await req.json();
      const user = await UsersService.createUserByAdmin(body, session.userId);
      return NextResponse.json({ success: true, user });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async updateUser(id: string, req: Request) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const updated = await UsersService.updateUser(id, body, session.userId);
      return NextResponse.json({ success: true, user: updated });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async toggleSuspend(id: string) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updated = await UsersService.toggleSuspend(id, session.userId);
      return NextResponse.json({ success: true, user: updated });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async generateResetCode(id: string) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const code = await UsersService.generateResetCodeForUser(id, session.userId);
      return NextResponse.json({ success: true, resetCode: code });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async reset2FA(id: string) {
    try {
      const session = await getSessionUser();
      // Deliberately SUPER_ADMIN only — an ADMIN/STAFF should not be able to strip another
      // admin's 2FA (that would be a privilege-escalation path for account takeover).
      if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only Super Admin can reset another account\'s 2FA' }, { status: 403 });
      }

      const updated = await UsersService.reset2FAForUser(id, session.userId);
      return NextResponse.json({ success: true, user: updated });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
