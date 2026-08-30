import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { PaymentsService } from './payments.service';

export class PaymentsController {
  static async getPayments() {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const payments = await PaymentsService.getPayments();
      return NextResponse.json({ payments });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
