'use client';

import React, { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripeClient } from '@/lib/stripe-client';
import { FiLock } from 'react-icons/fi';

interface Props {
  clientSecret: string;
  amountLabel: string;
  onSuccess: () => void;
}

function InnerForm({ amountLabel, onSuccess }: { amountLabel: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please check your card details.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      onSuccess();
    } else {
      setError('Payment could not be completed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-primary hover:opacity-90 text-primary-foreground font-black text-sm py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-60"
      >
        <FiLock className="shrink-0" />
        <span className="text-center leading-snug">
          {submitting ? 'Processing Payment...' : `Pay ${amountLabel} & Place Order`}
        </span>
      </button>
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, amountLabel, onSuccess }: Props) {
  return (
    <Elements
      stripe={getStripeClient()}
      options={{ clientSecret, appearance: { theme: 'stripe' } }}
    >
      <InnerForm amountLabel={amountLabel} onSuccess={onSuccess} />
    </Elements>
  );
}
