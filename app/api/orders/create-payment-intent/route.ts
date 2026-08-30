import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { OrdersService } from '@/server/modules/orders/orders.service';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();

    const userId = session?.userId || body.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User registration or login required' }, { status: 401 });
    }

    let createdByName: string | undefined;
    if (session && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || session.role === 'STAFF')) {
      createdByName = `${session.firstName} ${session.lastName} (${session.role})`;
    }

    // Create the order as PENDING (no stripePaymentId yet) using the same
    // authoritative pricing logic as a normal order.
    const order = await OrdersService.createOrder({
      items: body.items,
      shippingMethod: body.shippingMethod,
      shippingCountry: body.shippingCountry,
      shippingAddress: body.shippingAddress,
      paymentMethod: 'STRIPE_CARD',
      userId,
      createdByName,
    });

    const stripe = await getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'gbp',
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      automatic_payment_methods: { enabled: true },
    });

    await OrdersService.attachStripePaymentIntent(order.id, paymentIntent.id);

    return NextResponse.json({
      order,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to start payment' }, { status: 400 });
  }
}
