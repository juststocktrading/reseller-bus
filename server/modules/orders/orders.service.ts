import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export class OrdersService {
  static calculateShippingCost(
    method: 'DELIVERY' | 'PICKUP_BRADFORD',
    country: string,
    totalBaleCount: number
  ): number {
    if (method === 'PICKUP_BRADFORD') return 0;

    const normalizedCountry = country.toUpperCase().trim();
    if (normalizedCountry === 'UK' || normalizedCountry === 'UNITED KINGDOM') {
      return 20.0; // Standard UK Shipping
    }
    if (normalizedCountry === 'GHANA') {
      return 50.0 * Math.max(1, totalBaleCount);
    }
    if (normalizedCountry === 'NIGERIA') {
      return 60.0 * Math.max(1, totalBaleCount);
    }
    if (normalizedCountry === 'GAMBIA' || normalizedCountry === 'THE GAMBIA') {
      return 80.0 * Math.max(1, totalBaleCount);
    }
    // Europe & International fallback pro-rata calculation
    return 45.0 + Math.max(0, totalBaleCount - 1) * 20.0;
  }

  static async createOrder(data: {
    userId: string;
    items: { productId: string; quantity: number }[];
    shippingMethod: 'DELIVERY' | 'PICKUP_BRADFORD';
    shippingCountry: string;
    shippingAddress: string;
    paymentMethod?: string;
    stripePaymentId?: string;
    createdByName?: string;
    notes?: string;
  }) {
    // 1. Fetch products & validate stock
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let itemsTotal = 0;
    let totalBales = 0;

    const orderItemsData = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      itemsTotal += product.price * item.quantity;
      totalBales += item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // 2. Calculate bulk volume discount (3+ bales get 5% off)
    const bulkDiscount = totalBales >= 3 ? itemsTotal * 0.05 : 0;
    const itemsTotalAfterDiscount = itemsTotal - bulkDiscount;

    // 3. Shipping cost
    const shippingCost = this.calculateShippingCost(
      data.shippingMethod,
      data.shippingCountry,
      totalBales
    );

    const totalAmount = itemsTotalAfterDiscount + shippingCost;
    const orderNumber = `RB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        shippingMethod: data.shippingMethod,
        shippingCountry: data.shippingCountry,
        shippingAddress: data.shippingAddress,
        shippingCost,
        totalAmount,
        paymentMethod: data.paymentMethod || 'STRIPE',
        stripePaymentId: data.stripePaymentId || null,
        createdByName: data.createdByName || null,
        notes: data.notes || null,
        status: data.stripePaymentId ? 'PAID' : 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    await logAudit(
      'CREATE_ORDER',
      `Order ${order.orderNumber} created (£${totalAmount.toFixed(2)})`,
      data.userId
    );

    return order;
  }

  static async getOrders(userId?: string) {
    const where = userId ? { userId } : {};
    return await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, mobileNumber: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
  }

  static async attachStripePaymentIntent(orderId: string, paymentIntentId: string) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { stripePaymentId: paymentIntentId },
    });
  }

  static async markPaidByPaymentIntent(paymentIntentId: string) {
    const order = await prisma.order.findFirst({ where: { stripePaymentId: paymentIntentId } });
    if (!order || order.status === 'PAID') return order;

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
    });

    await logAudit('ORDER_PAID', `Order ${updated.orderNumber} marked PAID via Stripe webhook`, order.userId);
    return updated;
  }

  static async updateOrder(
    id: string,
    data: {
      status?: any;
      carrierName?: string;
      trackingNumber?: string;
      notes?: string;
    },
    adminId?: string
  ) {
    const updated = await prisma.order.update({
      where: { id },
      data,
      include: { user: true, items: { include: { product: true } } },
    });

    await logAudit(
      'UPDATE_ORDER',
      `Order ${updated.orderNumber} updated: Status=${updated.status}, Tracking=${updated.trackingNumber || 'N/A'}`,
      adminId
    );

    return updated;
  }
}
