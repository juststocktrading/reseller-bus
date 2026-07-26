import { CartController } from '@/server/modules/cart/cart.controller';

export async function POST(req: Request) {
  return CartController.syncCart(req);
}
