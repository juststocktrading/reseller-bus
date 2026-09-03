import { prisma } from '@/lib/db';
import { hashPassword, comparePassword, generateToken, generateResetCode, generatePendingToken, verifyPendingToken } from '@/lib/auth';
import { generateSecret, buildQrDataUrl, verifyTotpCode, generateBackupCodes, consumeBackupCode } from '@/lib/totp';
import { logAudit } from '@/lib/audit';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'STAFF'];

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

  /**
   * Verifies email + password. Regular USER accounts get a real session immediately.
   * STAFF/ADMIN/SUPER_ADMIN accounts must additionally pass TOTP 2FA — this returns either
   * a "requires_setup" (first time, no totpSecret enrolled yet) or "requires_2fa" (already
   * enrolled) result instead of a session token.
   */
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

    if (ADMIN_ROLES.includes(user.role)) {
      if (!user.totpEnabled) {
        const secret = generateSecret();
        await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });
        const qrDataUrl = await buildQrDataUrl(secret, user.email);
        const pendingToken = generatePendingToken({ userId: user.id, purpose: 'setup_2fa' });
        await logAudit('2FA_SETUP_STARTED', `2FA enrollment started for: ${user.email}`, user.id);
        return { status: 'requires_setup' as const, pendingToken, qrDataUrl, secretForManualEntry: secret };
      }

      const pendingToken = generatePendingToken({ userId: user.id, purpose: 'login_2fa' });
      return { status: 'requires_2fa' as const, pendingToken };
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await logAudit('USER_LOGIN', `Logged in: ${user.email}`, user.id);

    return { status: 'success' as const, user, token };
  }

  private static async issueSessionAfter2FA(user: { id: string; email: string; role: string; firstName: string; lastName: string }, auditAction: string) {
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    await logAudit(auditAction, `Logged in: ${user.email}`, user.id);
    return token;
  }

  /** Confirms first-time 2FA enrollment: verifies the code against the freshly-generated secret, enables 2FA, and issues the real session. */
  static async confirm2FASetup(pendingToken: string, code: string) {
    const decoded = verifyPendingToken(pendingToken, 'setup_2fa');
    if (!decoded) throw new Error('This setup link has expired. Please log in again.');

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.totpSecret) throw new Error('No pending 2FA setup found. Please log in again.');

    if (!verifyTotpCode(user.totpSecret, code)) {
      throw new Error('Invalid code. Check your authenticator app and try again.');
    }

    const { plaintext, hashed } = await generateBackupCodes();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: true, totpBackupCodes: JSON.stringify(hashed) },
    });

    const token = await this.issueSessionAfter2FA(updated, 'ENABLE_2FA');
    return { user: updated, token, backupCodes: plaintext };
  }

  /** Verifies a returning admin's 6-digit code (or a backup code) and issues the real session. */
  static async verify2FA(pendingToken: string, code: string) {
    const decoded = verifyPendingToken(pendingToken, 'login_2fa');
    if (!decoded) throw new Error('This login has expired. Please sign in again.');

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.totpSecret || !user.totpEnabled) {
      throw new Error('2FA is not set up on this account. Please sign in again.');
    }

    if (verifyTotpCode(user.totpSecret, code)) {
      const token = await this.issueSessionAfter2FA(user, 'LOGIN_2FA_SUCCESS');
      return { user, token, usedBackupCode: false };
    }

    const remainingBackupCodes = await consumeBackupCode(user.totpBackupCodes, code);
    if (remainingBackupCodes) {
      await prisma.user.update({ where: { id: user.id }, data: { totpBackupCodes: JSON.stringify(remainingBackupCodes) } });
      await logAudit('LOGIN_2FA_BACKUP_CODE_USED', `Backup code used for: ${user.email}`, user.id);
      const token = await this.issueSessionAfter2FA(user, 'LOGIN_2FA_SUCCESS');
      return { user, token, usedBackupCode: true };
    }

    await logAudit('LOGIN_2FA_FAILED', `Invalid 2FA code for: ${user.email}`, user.id);
    throw new Error('Invalid code. Please try again.');
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
