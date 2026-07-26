import { NextResponse } from 'next/server';
import { CategoriesService } from './categories.service';
import { getSessionUser } from '@/lib/auth';

export class CategoriesController {
  static async getAll() {
    const categories = await CategoriesService.getAll();
    return NextResponse.json({ categories });
  }

  static async create(req: Request) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { name, description } = await req.json();
      if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 });

      const category = await CategoriesService.create(name, description);
      return NextResponse.json({ success: true, category });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
    }
  }
}
