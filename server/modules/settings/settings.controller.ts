import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { SettingsService } from './settings.service';

function requireAdmin(session: any) {
  return session && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');
}

export class SettingsController {
  static async getStripeSettings() {
    try {
      const session = await getSessionUser();
      if (!requireAdmin(session)) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }

      const settings = await SettingsService.getStripeSettingsMasked();
      return NextResponse.json({ settings });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  static async updateStripeSettings(req: Request) {
    try {
      const session = await getSessionUser();
      if (!requireAdmin(session)) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }

      const body = await req.json();
      const adminName = `${session!.firstName} ${session!.lastName}`;
      const settings = await SettingsService.updateStripeSettings(body, adminName, session!.userId);
      return NextResponse.json({ success: true, settings });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 400 });
    }
  }
}
