import { prisma } from '@/lib/db';

export class CategoriesService {
  static async getAll() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  static async create(name: string, description?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return await prisma.category.create({
      data: { name, slug, description },
    });
  }
}
