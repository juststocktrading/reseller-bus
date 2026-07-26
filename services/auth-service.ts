import { apiClient } from './api-client';

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
    return apiClient<{ success: boolean; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
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
