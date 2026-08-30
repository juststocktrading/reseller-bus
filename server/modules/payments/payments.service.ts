import { prisma } from '@/lib/db';

export class PaymentsService {
  static async getPayments() {
    return await prisma.payment.findMany({
      include: {
        order: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, countryCode: true, mobileNumber: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Idempotent — Stripe can retry webhook delivery, so a record for the same
   * PaymentIntent + status is only ever created once.
   */
  static async recordPayment(data: {
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
  }) {
    if (data.stripePaymentIntentId) {
      const existing = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: data.stripePaymentIntentId, status: data.status },
      });
      if (existing) return existing;
    }

    return await prisma.payment.create({ data });
  }
}
