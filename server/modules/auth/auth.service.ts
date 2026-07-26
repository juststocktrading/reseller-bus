import { prisma } from '@/lib/db';
import { hashPassword, comparePassword, generateToken, generateResetCode } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export class AuthService {
  static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    mobileNumber: string;
    password: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        countryCode: data.countryCode || '+44',
        mobileNumber: data.mobileNumber,
        passwordHash,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await logAudit('USER_REGISTER', `Registered new account: ${user.email}`, user.id);

    return { user, token };
  }

  static async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.isSuspended) {
      throw new Error('Account suspended. Please contact support.');
    }

    const isValid = await comparePassword(pass, user.passwordHash);
    if (!isValid) {
      await logAudit('LOGIN_FAILED', `Invalid password for: ${email}`, user.id);
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await logAudit('USER_LOGIN', `Logged in: ${user.email}`, user.id);

    return { user, token };
  }

  static async resetPassword(userId: string, newPass: string) {
    const passwordHash = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, resetCode: null },
    });

    await logAudit('PASSWORD_RESET', `Password reset updated for user`, userId);
    return { success: true };
  }
}
