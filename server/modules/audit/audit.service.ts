import { prisma } from '@/lib/db';

export class AuditService {
  static async getLogs(limit = 100) {
    return await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, role: true } },
      },
    });
  }
}
