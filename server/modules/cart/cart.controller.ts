import { NextResponse } from 'next/server';
import { CartService } from './cart.service';
import { getSessionUser } from '@/lib/auth';

export class CartController {
  static async getLiveUserCarts() {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const carts = await CartService.getLiveUserCarts();
      return NextResponse.json({ carts });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  static async syncCart(req: Request) {
    try {
      const session = await getSessionUser();
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { items } = await req.json();
      const cart = await CartService.syncCart(session.userId, items || []);

      return NextResponse.json({ success: true, cart });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
