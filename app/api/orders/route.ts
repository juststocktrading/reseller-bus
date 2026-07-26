import { OrdersController } from '@/server/modules/orders/orders.controller';

export async function GET() {
  return OrdersController.getOrders();
}

export async function POST(req: Request) {
  return OrdersController.createOrder(req);
}
