import { apiClient } from './api-client';
import { Product } from '@/lib/types';

export class ProductService {
  static async getProducts(category?: string, search?: string, isPreOrder?: boolean) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (isPreOrder !== undefined) params.append('isPreOrder', String(isPreOrder));

    const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient<{ products: Product[] }>(url);
  }

  static async getProductById(id: string) {
    return apiClient<{ product: Product }>(`/api/products/${id}`);
  }

  static async createProduct(data: any) {
    return apiClient<{ success: boolean; product: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateProduct(id: string, data: any) {
    return apiClient<{ success: boolean; product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteProduct(id: string) {
    return apiClient<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }
}
