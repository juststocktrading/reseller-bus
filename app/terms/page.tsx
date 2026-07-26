import React from 'react';
import Link from 'next/link';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';

export const metadata = {
  title: 'Terms & Conditions | Reseller Bus',
  description: 'Terms and Conditions governing purchases from Reseller Bus. Business wholesale trade, sealed sack policies, pre-order terms, and refund guidelines.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 text-muted-foreground text-xs leading-relaxed">
      <div className="border-b border-border pb-6">
        <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full text-brand-red font-bold uppercase text-[11px] mb-3">
          <FiShield />
          <span>Legal & Business Terms</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-card-foreground">Terms & Conditions</h1>
        <p className="text-muted-foreground mt-1">
          Your usage of this website and your purchases from Reseller Bus are governed by these terms and conditions. You accept our terms and conditions by placing an order.
        </p>
      </div>

      <div className="space-y-6 bg-card border border-border p-5 sm:p-8 rounded-3xl shadow-xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Products & Stock Disclaimers</h2>
          <p>For resellers, we offer new clothes with tags and wholesale cream-grade garments.</p>
          <p>By making a purchase from us, you understand and agree that:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Unless otherwise noted, the majority of the items are either cream grade or brand-new with tags.</li>
            <li>There may be differences in brands, styles, sizes, colours, quality, and quantity.</li>
            <li>Certain brands, products, sizes, colours, or quantities cannot be guaranteed.</li>
            <li>For illustration purposes, sample photos and videos are included.</li>
            <li>Resale value, demand, and profitability may differ depending on the selling platform and the client.</li>
            <li>One of the main features of wholesale apparel is variations in the stock's contents.</li>
          </ul>
          <p className="pt-2">
            We do not open, examine, count, sort, grade, quality-check, or confirm the contents of sealed mixed sacks before shipping, unless specifically indicated differently.
          </p>
          <p>
            The existence, amount, condition, or resale value of any specific brand, style, size, color, or item type within a sack are not guaranteed.
          </p>
          <p>
            By placing a purchase, you attest to your comprehension of the nature of wholesale mixed-stock apparel and your acceptance of its inherent variability.
          </p>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Purchases for Businesses</h2>
          <p>Reseller Bus only sells goods that are meant to be used for business and resale.</p>
          <p>Customers attest that they are buying stock for trade, business, or resale when they place an order.</p>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Orders, Pricing & Payment</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Every order is based on availability.</li>
            <li>We hold the right to not accept or cancel orders as deemed necessary.</li>
            <li>The customer is responsible for the accuracy of all information submitted during purchase.</li>
            <li>All our products are priced in GBP (£).</li>
            <li>Full payment is expected before stocks are shipped or picked up.</li>
            <li>We have the right to change prices as deemed fit.</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Shipping & Delays</h2>
          <p>Shipping information and delivery estimates can be found in our FAQ page.</p>
          <p>We are not responsible for delays caused by:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Delivery companies or logistics carriers</li>
            <li>Customs inspection or export delays</li>
            <li>Errors caused by customer address submission</li>
            <li>Circumstances outside our reasonable control</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-border pt-6 bg-rose-50 p-4 rounded-xl border border-rose-200">
          <h2 className="text-sm font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <FiAlertTriangle /> Returns & Refunds Policy
          </h2>
          <p className="font-bold text-foreground">Please note we do not accept returns or issue refunds.</p>
          <p className="text-muted-foreground">All sales are final trade wholesale transactions.</p>
        </section>

        <div className="pt-4 border-t border-border text-center text-muted-foreground">
          <p className="font-bold text-foreground">Important Notice:</p>
          <p>By purchasing from Reseller Bus, you acknowledge and accept our full terms and conditions.</p>
        </div>
      </div>
    </div>
  );
}
