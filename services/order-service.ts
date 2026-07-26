import { apiClient } from './api-client';
import { Order } from '@/lib/types';

export class OrderService {
  static async createOrder(data: {
    items: { productId: string; quantity: number }[];
    shippingMethod: 'DELIVERY' | 'PICKUP_BRADFORD';
    shippingCountry: string;
    shippingAddress: string;
    paymentMethod?: string;
    stripePaymentId?: string;
    userId?: string;
  }) {
    return apiClient<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createPaymentIntent(data: {
    items: { productId: string; quantity: number }[];
    shippingMethod: 'DELIVERY' | 'PICKUP_BRADFORD';
    shippingCountry: string;
    shippingAddress: string;
    userId?: string;
  }) {
    return apiClient<{ order: Order; clientSecret: string }>('/api/orders/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getOrders() {
    return apiClient<{ orders: Order[] }>('/api/orders');
  }

  static async getOrderById(id: string) {
    return apiClient<{ order: Order }>(`/api/orders/${id}`);
  }

  static async updateOrder(
    id: string,
    data: {
      status?: string;
      carrierName?: string;
      trackingNumber?: string;
      notes?: string;
    }
  ) {
    return apiClient<{ success: boolean; order: Order }>(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
