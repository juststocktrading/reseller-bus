import { NextResponse } from 'next/server';
import { OrdersService } from './orders.service';
import { getSessionUser } from '@/lib/auth';

export class OrdersController {
  static async createOrder(req: Request) {
    try {
      const session = await getSessionUser();
      const body = await req.json();

      const userId = session?.userId || body.userId;
      if (!userId) {
        return NextResponse.json({ error: 'User registration or login required' }, { status: 401 });
      }

      // Check if admin is ordering on behalf of user
      let createdByName = undefined;
      if (session && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || session.role === 'STAFF')) {
        createdByName = `${session.firstName} ${session.lastName} (${session.role})`;
      }

      const order = await OrdersService.createOrder({
        ...body,
        userId,
        createdByName,
      });

      return NextResponse.json({ success: true, order });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 400 });
    }
  }

  static async getOrders() {
    try {
      const session = await getSessionUser();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // If regular user, return their own orders. If admin/staff, return all orders.
      const userId = (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || session.role === 'STAFF')
        ? undefined
        : session.userId;

      const orders = await OrdersService.getOrders(userId);
      return NextResponse.json({ orders });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  static async getOrderById(id: string) {
    try {
      const session = await getSessionUser();
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const order = await OrdersService.getOrderById(id);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      // Guard: user can only see their own order unless admin/staff
      if (order.userId !== session.userId && session.role === 'USER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({ order });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  static async updateOrder(id: string, req: Request) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const updated = await OrdersService.updateOrder(id, body, session.userId);
      return NextResponse.json({ success: true, order: updated });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
