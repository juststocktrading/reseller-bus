'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { OrderService } from '@/services/order-service';
import { AuthService } from '@/services/auth-service';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import InvoiceDocument from '@/components/InvoiceDocument';
import InvoicePrintButton from '@/components/InvoicePrintButton';
import { sanitizeDigits } from '@/lib/input-utils';
import { Order } from '@/lib/types';
import { FiCheckCircle, FiTruck, FiMapPin, FiCreditCard, FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';

type Step = 'details' | 'payment' | 'success';

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'details', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'success', label: 'Confirmation' },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < activeIndex
                  ? 'bg-emerald-500 text-white'
                  : i === activeIndex
                  ? 'bg-brand-red text-white'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {i < activeIndex ? <FiCheck /> : i + 1}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${i <= activeIndex ? 'text-white' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <div className={`w-6 sm:w-12 h-0.5 ${i < activeIndex ? 'bg-emerald-500' : 'bg-border'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, totalItems, subtotal, bulkDiscount } = useCart();

  const [step, setStep] = useState<Step>('details');

  const [user, setUser] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<'DELIVERY' | 'PICKUP_BRADFORD'>('DELIVERY');
  const [shippingCountry, setShippingCountry] = useState('UK');
  const [shippingAddress, setShippingAddress] = useState('');

  // Guest / User info form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [mobileNumber, setMobileNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [payment, setPayment] = useState<{ order: Order; clientSecret: string } | null>(null);

  useEffect(() => {
    AuthService.getMe()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
          setFirstName(res.user.firstName || '');
          setLastName(res.user.lastName || '');
          setEmail(res.user.email || '');
        }
      })
      .catch(() => { });
  }, []);

  // Shipping Matrix Calculation
  let shippingCost = 0;
  if (shippingMethod === 'PICKUP_BRADFORD') {
    shippingCost = 0;
  } else {
    if (shippingCountry === 'UK') shippingCost = 20.0;
    else if (shippingCountry === 'Ghana') shippingCost = 50.0 * Math.max(1, totalItems);
    else if (shippingCountry === 'Nigeria') shippingCost = 60.0 * Math.max(1, totalItems);
    else if (shippingCountry === 'Gambia') shippingCost = 80.0 * Math.max(1, totalItems);
    else shippingCost = 45.0 + Math.max(0, totalItems - 1) * 20.0;
  }

  const finalTotal = subtotal - bulkDiscount + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('You must accept the Reseller Bus Terms & Conditions before placing your order.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      let targetUserId = user?.userId;

      // If guest checkout, register user or log in automatically
      if (!targetUserId) {
        try {
          const regRes = await AuthService.register({
            firstName,
            lastName,
            email,
            countryCode,
            mobileNumber,
            password: `Rb-${crypto.randomUUID()}`,
          });
          targetUserId = regRes.user.id;
        } catch (e: any) {
          // If user exists, prompt to sign in
          setError('An account with this email already exists. Please sign in first.');
          setLoading(false);
          return;
        }
      }

      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await OrderService.createPaymentIntent({
        userId: targetUserId,
        items,
        shippingMethod,
        shippingCountry,
        shippingAddress:
          shippingMethod === 'PICKUP_BRADFORD'
            ? 'Bradford Warehouse Pickup (Unit 7, 5 Alive, York Road, Bradford BD8 0HR)'
            : shippingAddress,
      });

      setPayment({ order: res.order, clientSecret: res.clientSecret });
      setStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to start payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (!payment) return;
    setOrderSuccess(payment.order);
    setStep('success');
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDetails = () => {
    // The PENDING order already created for this attempt is left as-is (visible/manageable
    // in the admin Orders tab) — starting over simply creates a fresh one on next submit.
    setPayment(null);
    setError('');
    setStep('details');
  };

  // ---- Step 3: Confirmation + Receipt ----
  if (step === 'success' && orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <StepIndicator step={step} />

        <div className="bg-card border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl text-center print:hidden">
          <FiCheckCircle className="text-5xl sm:text-6xl text-emerald-400 mx-auto animate-bounce" />
          <h2 className="text-2xl sm:text-3xl font-black text-white">Order Confirmed!</h2>
          <p className="text-xs sm:text-sm text-muted-foreground break-words">
            Thank you for your order with Reseller Bus. Your order reference is{' '}
            <strong className="text-brand-red font-mono font-bold text-sm">{orderSuccess.orderNumber}</strong> — a copy of your receipt is below.
          </p>
          {!user && (
            <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
              We've created a Reseller Bus account for you and signed you in. Head to Account settings to set your own password for next time.
            </p>
          )}
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <InvoicePrintButton />
            <button
              onClick={() => router.push('/account')}
              className="bg-muted hover:bg-border text-foreground font-bold text-xs px-6 py-3.5 rounded-xl min-h-[48px]"
            >
              View Order in Customer Portal
            </button>
          </div>
        </div>

        {/* Receipt */}
        <InvoiceDocument order={orderSuccess} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Wholesale Order Checkout</h1>
        <StepIndicator step={step} />
      </div>

      {error && <div className="bg-rose-950 border border-rose-600/40 text-rose-300 p-4 rounded-2xl text-xs font-semibold">{error}</div>}

      {/* ---- Step 1: Shipping & Customer Details ---- */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Fulfillment Mode Selector */}
            <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FiTruck className="text-brand-red shrink-0" /> Choose Fulfillment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShippingMethod('DELIVERY')}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${shippingMethod === 'DELIVERY'
                      ? 'bg-rose-50 border-brand-red text-foreground'
                      : 'bg-muted border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🚚 Delivery Freight Cargo</span>
                    {shippingMethod === 'DELIVERY' && <span className="text-brand-red text-xs">✓ Selected</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">UK (£20), Ghana (£50), Nigeria (£60), Gambia (£80), Europe</p>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod('PICKUP_BRADFORD')}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${shippingMethod === 'PICKUP_BRADFORD'
                      ? 'bg-rose-50 border-brand-red text-foreground'
                      : 'bg-muted border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🏬 Bradford Warehouse Pickup</span>
                    {shippingMethod === 'PICKUP_BRADFORD' && <span className="text-brand-red text-xs">✓ Selected</span>}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold mt-2">FREE Pickup (Unit 7, 5 Alive, York Rd)</p>
                </button>
              </div>
            </div>

            {/* Shipping Country & Address */}
            {shippingMethod === 'DELIVERY' && (
              <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl space-y-4 shadow-xl text-xs">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <FiMapPin className="text-brand-red shrink-0" /> Shipping Destination
                </h3>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Destination Country</label>
                  <select
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  >
                    <option value="UK">United Kingdom (£20.00)</option>
                    <option value="Ghana">Ghana (£50.00 per bale)</option>
                    <option value="Nigeria">Nigeria (£60.00 per bale)</option>
                    <option value="Gambia">Gambia (£80.00 per bale)</option>
                    <option value="Europe">Europe & EU Countries (Pro-rata)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Delivery Address & Postal Code</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Street address, City, Region/Postcode..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>
              </div>
            )}

            {/* Customer Details Form */}
            {!user && (
              <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl space-y-4 shadow-xl text-xs">
                <h3 className="font-bold text-white text-sm">Reseller Customer Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground font-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl p-3 text-foreground min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl p-3 text-foreground min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl p-3 text-foreground min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-foreground font-semibold mb-1">Country Code</label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl p-3 text-foreground min-h-[44px]"
                    >
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+233">🇬🇭 +233 (Ghana)</option>
                      <option value="+234">🇳🇬 +234 (Nigeria)</option>
                      <option value="+220">🇬🇲 +220 (Gambia)</option>
                      <option value="+49">🇩🇪 +49 (Germany)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-foreground font-semibold mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      placeholder="7344056285"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(sanitizeDigits(e.target.value))}
                      className="w-full bg-muted border border-border rounded-xl p-3 text-foreground min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Review */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="font-bold text-card-foreground text-base border-b border-border pb-3">Order Review</h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between gap-3 text-xs text-muted-foreground">
                    <span className="line-clamp-2 min-w-0">{quantity}x {product.title}</span>
                    <span className="font-mono font-bold shrink-0">£{(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-mono text-foreground">£{subtotal.toFixed(2)}</span>
                </div>

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Bulk 5% Discount:</span>
                    <span className="font-mono">-£{bulkDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping ({shippingMethod === 'PICKUP_BRADFORD' ? 'Pickup' : shippingCountry}):</span>
                  <span className="font-mono text-foreground">£{shippingCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex flex-wrap justify-between items-center gap-2 text-base font-bold text-card-foreground">
                <span>Total Amount:</span>
                <span className="font-mono text-xl sm:text-2xl text-brand-red font-black">£{finalTotal.toFixed(2)}</span>
              </div>

              {/* Terms Acceptance */}
              <div className="flex items-start space-x-2 text-xs text-muted-foreground pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-foreground rounded focus:ring-foreground/40"
                />
                <label htmlFor="terms" className="cursor-pointer">
                  I understand and agree to the <a href="/terms" target="_blank" className="text-brand-red underline">Terms & Conditions</a> (trade wholesale purchases, sealed sack variations, no refunds policy).
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary min-h-[52px] text-sm">
                <FiCreditCard className="shrink-0" />
                <span className="text-center leading-snug">
                  {loading ? 'Preparing Payment...' : `Continue to Payment (£${finalTotal.toFixed(2)})`}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ---- Step 2: Payment ---- */}
      {step === 'payment' && payment && (
        <div className="max-w-lg mx-auto space-y-4">
          <button
            onClick={handleBackToDetails}
            className="text-muted-foreground hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <FiArrowLeft /> Edit shipping details
          </button>

          <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-bold text-card-foreground text-base border-b border-border pb-3">Order Summary</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span className="line-clamp-2 min-w-0">{quantity}x {product.title}</span>
                  <span className="font-mono font-bold shrink-0">£{(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex flex-wrap justify-between items-center gap-2 text-base font-bold text-card-foreground">
              <span>Total Amount:</span>
              <span className="font-mono text-xl sm:text-2xl text-brand-red font-black">£{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-foreground font-bold border-b border-border pb-2 text-xs">
              <span className="flex items-center gap-1.5"><FiCreditCard className="text-brand-red" /> Credit / Debit Card (Stripe)</span>
              <FiLock className="text-emerald-400 text-sm" />
            </div>
            <StripePaymentForm
              clientSecret={payment.clientSecret}
              amountLabel={`£${finalTotal.toFixed(2)}`}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
