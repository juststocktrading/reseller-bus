import React from 'react';
import Link from 'next/link';
import { FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export const metadata = {
  title: 'Pre-Order Information | Reseller Bus',
  description: 'Learn about pre-ordering high demand 50kg wholesale clothing bales from Reseller Bus. Secure premium stock before container arrival.',
};

export default function PreOrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 text-muted-foreground text-xs leading-relaxed">
      <div className="border-b border-border pb-6 text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-full text-purple-700 font-bold uppercase text-[11px]">
          <FiClock />
          <span>Pre-Order Guidelines</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-card-foreground">Pre-Order Information</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          You can pay for orders before stocks arrive. Join our waiting list for high demand stocks to ensure you are never left out from premium supplies.
        </p>
      </div>

      <div className="bg-card border border-border p-5 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">How Pre-Orders Work</h2>
          <p>The supply of stocks rises and falls due to seasonal movement of the market.</p>
          <p>Pre-orders can be done by making full payment for stocks listed as pre-orders on our platform.</p>
        </section>

        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Delivery Timeframes & Flexibility</h2>
          <p>We try our best to deliver orders within the discussed time frame, however delays could happen due to events beyond our jurisdiction.</p>
          <div className="bg-muted p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center space-x-2 text-foreground font-bold">
              <FiCheckCircle className="text-emerald-600" />
              <span>Key Confirmation</span>
            </div>
            <p className="text-muted-foreground">
              By pre-ordering, you agree and confirm that delivery dates are subject to change.
            </p>
            <p className="text-muted-foreground">
              We try to notify affected customers as soon as we can if any significant delay is expected.
            </p>
          </div>
        </section>

        <section className="border-t border-border pt-6 text-center space-y-4">
          <p className="font-bold text-foreground text-sm">By pre-ordering, you accept these terms. We truly appreciate your business!</p>
          <div>
            <Link href="/shop?isPreOrder=true" className="btn-pill inline-flex items-center space-x-2">
              <span>View Available Pre-Order Bales</span>
              <FiArrowRight />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
