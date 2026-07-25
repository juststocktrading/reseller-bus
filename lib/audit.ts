import { prisma } from './db';

export async function logAudit(
  action: string,
  details: string,
  userId?: string | null,
  ipAddress: string = '127.0.0.1'
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        userId: userId || null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
}
