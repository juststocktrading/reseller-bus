import { CategoriesController } from '@/server/modules/categories/categories.controller';

export async function GET() {
  return CategoriesController.getAll();
}

export async function POST(req: Request) {
  return CategoriesController.create(req);
}
