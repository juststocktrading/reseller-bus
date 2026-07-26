import { apiClient } from './api-client';
import { User } from '@/lib/types';

export class AdminService {
  static async getUsers() {
    return apiClient<{ users: User[] }>('/api/admin/users');
  }

  static async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    countryCode?: string;
    mobileNumber: string;
    password: string;
    role: string;
  }) {
    return apiClient<{ success: boolean; user: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateUser(id: string, data: any) {
    return apiClient<{ success: boolean; user: User }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async toggleSuspend(id: string) {
    return apiClient<{ success: boolean; user: User }>(`/api/admin/users/${id}`, {
      method: 'PATCH',
    });
  }

  static async generateResetCode(id: string) {
    return apiClient<{ success: boolean; resetCode: string }>(`/api/admin/users/${id}/reset-code`, {
      method: 'POST',
    });
  }

  static async getLiveCarts() {
    return apiClient<{ carts: any[] }>('/api/admin/carts');
  }

  static async getAuditLogs() {
    return apiClient<{ logs: any[] }>('/api/admin/audit-logs');
  }
}
