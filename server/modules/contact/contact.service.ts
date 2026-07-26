import { prisma } from '@/lib/db';

export class ContactService {
  static async create(data: {
    name: string;
    email: string;
    phone: string;
    country: string;
    stockInterest?: string;
    message: string;
  }) {
    return await prisma.contactMessage.create({ data });
  }

  static async getAll() {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markRead(id: string) {
    return await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
