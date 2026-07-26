import { CartController } from '@/server/modules/cart/cart.controller';

export async function GET() {
  return CartController.getLiveUserCarts();
}
