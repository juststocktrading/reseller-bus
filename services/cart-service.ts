import { apiClient } from './api-client';

export class CartService {
  static async syncCart(items: { productId: string; quantity: number }[]) {
    return apiClient<{ success: boolean; cart: any[] }>('/api/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }
}
