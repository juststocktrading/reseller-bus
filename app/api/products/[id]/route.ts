import { ProductsController } from '@/server/modules/products/products.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return ProductsController.getById(params.id);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return ProductsController.update(params.id, req);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return ProductsController.delete(params.id);
}
