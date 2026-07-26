import { NextResponse } from 'next/server';
import { AuditService } from './audit.service';
import { getSessionUser } from '@/lib/auth';

export class AuditController {
  static async getLogs() {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const logs = await AuditService.getLogs();
      return NextResponse.json({ logs });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
