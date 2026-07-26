import { NextResponse } from 'next/server';
import { ProductsService } from './products.service';
import { getSessionUser } from '@/lib/auth';

export class ProductsController {
  static async getAll(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const preOrder = searchParams.get('isPreOrder');
    const isPreOrder = preOrder !== null ? preOrder === 'true' : undefined;

    const products = await ProductsService.getAll({ category, search, isPreOrder });
    return NextResponse.json({ products });
  }

  static async getById(id: string) {
    const product = await ProductsService.getById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  }

  static async create(req: Request) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const product = await ProductsService.create(body, session.userId);
      return NextResponse.json({ success: true, product });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 400 });
    }
  }

  static async update(id: string, req: Request) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'STAFF')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const updated = await ProductsService.update(id, body, session.userId);
      return NextResponse.json({ success: true, product: updated });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 400 });
    }
  }

  static async delete(id: string) {
    try {
      const session = await getSessionUser();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await ProductsService.delete(id, session.userId);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 400 });
    }
  }
}
