import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export class ProductsService {
  static async getAll(query?: { category?: string; search?: string; isPreOrder?: boolean }) {
    const where: any = {};

    if (query?.category) {
      where.category = { slug: query.category };
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { grade: { contains: query.search } },
      ];
    }

    if (query?.isPreOrder !== undefined) {
      where.isPreOrder = query.isPreOrder;
    }

    return await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  static async create(data: any, userId?: string) {
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const imagesJson = typeof data.images === 'string' ? data.images : JSON.stringify(data.images || []);

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug,
        categoryId: data.categoryId,
        price: Number(data.price),
        weightKg: Number(data.weightKg || 50),
        grade: data.grade || 'Cream Grade NWT (95% New)',
        estimatedPieces: data.estimatedPieces || '160 - 200 pcs',
        avgCostPerPiece: data.avgCostPerPiece ? Number(data.avgCostPerPiece) : null,
        estimatedResale: data.estimatedResale ? Number(data.estimatedResale) : null,
        stockCount: Number(data.stockCount || 10),
        isPreOrder: Boolean(data.isPreOrder),
        description: data.description || '',
        images: imagesJson,
      },
    });

    await logAudit('CREATE_PRODUCT', `Created product: ${product.title} (£${product.price})`, userId);

    return product;
  }

  static async update(id: string, data: any, userId?: string) {
    const updateData: any = { ...data };
    if (data.images && typeof data.images !== 'string') {
      updateData.images = JSON.stringify(data.images);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    await logAudit('UPDATE_PRODUCT', `Updated product: ${updated.title}`, userId);

    return updated;
  }

  static async delete(id: string, userId?: string) {
    const deleted = await prisma.product.delete({ where: { id } });
    await logAudit('DELETE_PRODUCT', `Deleted product ID: ${id}`, userId);
    return deleted;
  }
}
