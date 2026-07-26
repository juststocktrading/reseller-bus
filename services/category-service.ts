import { apiClient } from './api-client';
import { Category } from '@/lib/types';

export class CategoryService {
  static async getCategories() {
    return apiClient<{ categories: Category[] }>('/api/categories');
  }

  static async createCategory(data: { name: string; description?: string }) {
    return apiClient<{ success: boolean; category: Category }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
