import { apiClient } from './api-client';

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export type LoginResponse =
  | { success: true; user: PublicUser }
  | { requiresSetup: true; pendingToken: string; qrDataUrl: string; secretForManualEntry: string }
  | { requires2FA: true; pendingToken: string };

export class AuthService {
  static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    mobileNumber: string;
    password: string;
  }) {
    return apiClient<{ success: boolean; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async login(email: string, pass: string) {
    return apiClient<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
  }

  /** First-time 2FA enrollment: confirms the code against the freshly-issued QR secret. */
  static async confirm2FASetup(pendingToken: string, code: string) {
    return apiClient<{ success: boolean; user: PublicUser; backupCodes: string[] }>('/api/auth/2fa/setup/confirm', {
      method: 'POST',
      body: JSON.stringify({ pendingToken, code }),
    });
  }

  /** Returning admin: verifies a 6-digit TOTP code or a backup code. */
  static async verify2FA(pendingToken: string, code: string) {
    return apiClient<{ success: boolean; user: PublicUser; usedBackupCode: boolean }>('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ pendingToken, code }),
    });
  }

  static async logout() {
    return apiClient<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  }

  static async getMe() {
    return apiClient<{ user: any }>('/api/auth/me');
  }

  static async resetPassword(newPassword: string) {
    return apiClient<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }
}
