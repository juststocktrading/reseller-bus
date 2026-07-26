import { NextResponse } from 'next/server';
import { ContactService } from './contact.service';
import { getSessionUser } from '@/lib/auth';

export class ContactController {
  static async create(req: Request) {
    try {
      const body = await req.json();
      if (!body.name || !body.email || !body.phone || !body.message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const submission = await ContactService.create({
        name: body.name,
        email: body.email,
        phone: body.phone,
        country: body.country || 'United Kingdom',
        stockInterest: body.stockInterest,
        message: body.message,
      });

      return NextResponse.json({ success: true, submission });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 400 });
    }
  }

  static async getAll() {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const messages = await ContactService.getAll();
      return NextResponse.json({ messages });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  static async markRead(id: string) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updated = await ContactService.markRead(id);
      return NextResponse.json({ success: true, message: updated });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
