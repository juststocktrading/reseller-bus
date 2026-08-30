import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe';
import { OrdersService } from '@/server/modules/orders/orders.service';
import { PaymentsService } from '@/server/modules/payments/payments.service';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = await getStripeWebhookSecret();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = await getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const order = await OrdersService.markPaidByPaymentIntent(paymentIntent.id);

    if (order) {
      // Expand the intent to pull the hosted receipt URL and card details for our records.
      const full = await stripe.paymentIntents.retrieve(paymentIntent.id, {
        expand: ['latest_charge'],
      });
      const charge = full.latest_charge as Stripe.Charge | null;
      const cardDetails = charge?.payment_method_details?.card;

      await PaymentsService.recordPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'SUCCEEDED',
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: charge?.id || null,
        receiptUrl: charge?.receipt_url || null,
        cardBrand: cardDetails?.brand || null,
        cardLast4: cardDetails?.last4 || null,
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const order = await OrdersService.getOrderByPaymentIntent(paymentIntent.id);

    if (order) {
      await PaymentsService.recordPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'FAILED',
        stripePaymentIntentId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      });
    }
  }

  return NextResponse.json({ received: true });
}
