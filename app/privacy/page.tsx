import React from 'react';
import { FiLock } from 'react-icons/fi';

export const metadata = {
  title: 'Privacy Policy | Reseller Bus',
  description: 'How Reseller Bus collects, uses, and protects your personal data when you browse, register, or place a wholesale order.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 text-muted-foreground text-xs leading-relaxed">
      <div className="border-b border-border pb-6">
        <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full text-brand-red font-bold uppercase text-[11px] mb-3">
          <FiLock />
          <span>Data & Privacy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-card-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mt-1">
          This policy explains what personal information Reseller Bus collects, why we collect it, and how it's used, stored, and protected when you use this website or place an order.
        </p>
      </div>

      <div className="space-y-6 bg-card border border-border p-5 sm:p-8 rounded-3xl shadow-xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Information We Collect</h2>
          <p>When you register, log in, or place an order, we collect:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Name, email address, and mobile number</li>
            <li>Delivery/shipping address and destination country</li>
            <li>Order history and cart contents</li>
            <li>Payment confirmation details from Stripe (we do not store your full card number ourselves)</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>To process and fulfil your wholesale orders, including shipping and customs export documentation</li>
            <li>To manage your account and order history</li>
            <li>To respond to enquiries submitted through our contact form</li>
            <li>To send order confirmations, dispatch/tracking updates, and account-related notices</li>
            <li>To detect and prevent fraud, abuse, or unauthorised account access</li>
          </ul>
          <p>We do not sell or rent your personal information to third parties.</p>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Payments</h2>
          <p>
            Card payments are processed securely by Stripe. Reseller Bus does not receive or store your full card
            number, expiry date, or CVC — these are handled entirely by Stripe in accordance with their own privacy
            and security standards.
          </p>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Cookies & Session Data</h2>
          <p>
            We use a small, essential session cookie to keep you logged in and to remember guest cart contents.
            This is strictly necessary for the site to function and is not used for advertising or tracking across
            other websites.
          </p>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Data Sharing</h2>
          <p>We only share your information with trusted service providers strictly as needed to run the business:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Stripe — payment processing</li>
            <li>Cloudinary — hosting of product images</li>
            <li>Our hosting and database providers — to securely operate the website and store order records</li>
            <li>Delivery and freight partners — solely to fulfil and track your shipment</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Data Retention</h2>
          <p>
            We retain account and order information for as long as your account is active or as needed to meet our
            legal, accounting, and export/customs record-keeping obligations.
          </p>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Your Rights</h2>
          <p>You can, at any time:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Update your password from your Account settings</li>
            <li>Request a copy of the personal data we hold about you</li>
            <li>Request correction or deletion of your personal data, subject to our order/legal record-keeping requirements</li>
          </ul>
          <p>To make a request, contact us using the details below.</p>
        </section>

        <section className="space-y-2 border-t border-border pt-6">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-wider">Contact Us</h2>
          <p>
            For any privacy-related questions or requests, contact us at{' '}
            <a href="mailto:info@resellerbus.co.uk" className="text-brand-red underline">
              info@resellerbus.co.uk
            </a>{' '}
            or Unit 7, 5 Alive, York Road, Bradford BD8 0HR, United Kingdom.
          </p>
        </section>

        <div className="pt-4 border-t border-border text-center text-muted-foreground">
          <p>This policy may be updated from time to time. Continued use of the site after changes means you accept the updated policy.</p>
        </div>
      </div>
    </div>
  );
}
