import { ProductsController } from '@/server/modules/products/products.controller';

export async function GET(req: Request) {
  return ProductsController.getAll(req);
}

export async function POST(req: Request) {
  return ProductsController.create(req);
}
