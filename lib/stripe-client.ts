import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

// The publishable key is now admin-configured (stored in the database) rather
// than baked in at build time, so fetch it at runtime from the public
// /api/payment-config endpoint.
export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = fetch('/api/payment-config')
      .then((r) => r.json())
      .then((data) => (data.publishableKey ? loadStripe(data.publishableKey) : null))
      .catch(() => null);
  }
  return stripePromise;
}
