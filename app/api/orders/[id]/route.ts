import { OrdersController } from '@/server/modules/orders/orders.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return OrdersController.getOrderById(params.id);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return OrdersController.updateOrder(params.id, req);
}
