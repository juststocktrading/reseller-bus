import { apiClient } from './api-client';
import { Order } from '@/lib/types';

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  stripePaymentIntentId?: string | null;
  stripeChargeId?: string | null;
  receiptUrl?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
  failureReason?: string | null;
  createdAt: string;
  order: Order;
}

export class PaymentService {
  static async getPayments() {
    return apiClient<{ payments: Payment[] }>('/api/admin/payments');
  }
}
