import { apiClient } from './api-client';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  stockInterest?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export class ContactService {
  static async submit(data: {
    name: string;
    email: string;
    phone: string;
    country: string;
    stockInterest?: string;
    message: string;
  }) {
    return apiClient<{ success: boolean }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getAll() {
    return apiClient<{ messages: ContactMessage[] }>('/api/contact');
  }

  static async markRead(id: string) {
    return apiClient<{ success: boolean }>(`/api/contact/${id}`, { method: 'PATCH' });
  }
}
