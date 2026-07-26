import { prisma } from '@/lib/db';
import { hashPassword, generateResetCode } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export class UsersService {
  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        countryCode: true,
        mobileNumber: true,
        role: true,
        isSuspended: true,
        resetCode: true,
        createdAt: true,
        _count: { select: { orders: true, cartItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createUserByAdmin(data: {
    firstName: string;
    lastName: string;
    email: string;
    countryCode?: string;
    mobileNumber: string;
    password: string;
    role: any;
  }, adminId: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new Error('User already exists');

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        countryCode: data.countryCode || '+44',
        mobileNumber: data.mobileNumber,
        passwordHash,
        role: data.role || 'USER',
      },
    });

    await logAudit('ADMIN_CREATE_USER', `Created ${data.role} account for ${data.email}`, adminId);
    return user;
  }

  static async updateUser(id: string, data: any, adminId: string) {
    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    await logAudit('ADMIN_UPDATE_USER', `Updated details for ${updated.email} (Role: ${updated.role})`, adminId);
    return updated;
  }

  static async toggleSuspend(id: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    const updated = await prisma.user.update({
      where: { id },
      data: { isSuspended: !user.isSuspended },
    });

    await logAudit(
      'ADMIN_SUSPEND_USER',
      `${updated.isSuspended ? 'Suspended' : 'Unsuspended'} user ${updated.email}`,
      adminId
    );

    return updated;
  }

  static async generateResetCodeForUser(id: string, adminId: string) {
    const code = await generateResetCode(id);
    await logAudit('ADMIN_GENERATE_RESET_CODE', `Generated reset code for user ID ${id}: ${code}`, adminId);
    return code;
  }
}
