import { prisma } from '@/lib/db';
import { hashPassword, generateResetCode } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// Never select passwordHash, totpSecret, or totpBackupCodes into a response body — these are
// only ever read/written internally (auth.service.ts, totp verification), never returned to a client.
const SAFE_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  countryCode: true,
  mobileNumber: true,
  role: true,
  isSuspended: true,
  resetCode: true,
  totpEnabled: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UsersService {
  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        ...SAFE_USER_SELECT,
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
      select: SAFE_USER_SELECT,
    });

    await logAudit('ADMIN_CREATE_USER', `Created ${data.role} account for ${data.email}`, adminId);
    return user;
  }

  static async updateUser(id: string, data: any, adminId: string) {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: SAFE_USER_SELECT,
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
      select: SAFE_USER_SELECT,
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

  /** Clears a locked-out admin/staff member's 2FA enrollment so they can re-enroll on next login. */
  static async reset2FAForUser(id: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    const updated = await prisma.user.update({
      where: { id },
      data: { totpSecret: null, totpEnabled: false, totpBackupCodes: null },
      select: SAFE_USER_SELECT,
    });

    await logAudit('ADMIN_RESET_2FA', `Reset 2FA enrollment for ${updated.email}`, adminId);
    return updated;
  }
}
