import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { OrdersService } from '@/server/modules/orders/orders.service';
import { signInvoiceToken } from '@/lib/share-links';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const order = await OrdersService.getOrderById(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const token = signInvoiceToken(order.id);
    const origin = new URL(req.url).origin;
    const url = `${origin}/invoice/${order.id}?token=${token}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
