'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiTruck, FiShield } from 'react-icons/fi';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems, bulkDiscount } = useCart();

  const finalTotal = subtotal - bulkDiscount;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-4">
        <div className="bg-muted text-foreground p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-border">
          <FiShoppingBag className="text-4xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">Your Cart is Empty</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Explore our wholesale catalog of clothing bales (Kids, Women, Men, General Mix).
        </p>
        <div className="pt-2">
          <Link href="/shop" className="btn-primary !w-auto px-8 mx-auto">
            <span>Start Shopping</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          Your Cart ({totalItems} {totalItems === 1 ? 'bale' : 'bales'})
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your bales before shipping & checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-3 sm:space-y-4 min-w-0">
          {cart.map((item) => {
            let images: string[] = [];
            try {
              images =
                typeof item.product.images === 'string'
                  ? JSON.parse(item.product.images)
                  : item.product.images;
            } catch {
              images = [
                'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
              ];
            }
            const mainImg =
              images[0] ||
              'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={item.product.id}
                className="bg-card border border-border p-3 sm:p-5 rounded-2xl flex flex-col gap-3 sm:gap-4 shadow-sm min-w-0"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    <Image src={mainImg} alt={item.product.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-brand-red uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {item.product.weightKg || 50}kg Bale
                    </span>
                    <h3 className="font-bold text-foreground text-sm leading-snug">
                      {item.product.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      £{item.product.price.toFixed(2)} per bale
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-muted-foreground hover:text-rose-600 p-2 transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                    title="Remove Bale"
                    aria-label="Remove item"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                  <div className="flex items-center border border-border rounded-xl bg-muted overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-3 py-2 text-foreground hover:bg-accent font-bold min-h-[40px] min-w-[40px]"
                      aria-label="Decrease"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-3 py-2 text-foreground hover:bg-accent font-bold min-h-[40px] min-w-[40px]"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right font-black text-foreground text-base font-mono">
                    £{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-muted border border-border p-5 sm:p-6 rounded-2xl space-y-5 shadow-sm lg:sticky lg:top-24">
            <h3 className="font-extrabold text-foreground text-lg border-b border-border pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between gap-3">
                <span>Subtotal ({totalItems} bales)</span>
                <span className="font-bold text-foreground font-mono">£{subtotal.toFixed(2)}</span>
              </div>

              {totalItems >= 3 ? (
                <div className="flex justify-between gap-3 text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs sm:text-sm">
                  <span>5% Volume Discount</span>
                  <span>-£{bulkDiscount.toFixed(2)}</span>
                </div>
              ) : (
                <div className="text-xs text-foreground bg-background p-2.5 rounded-xl border border-border font-medium">
                  Add {3 - totalItems} more bale(s) to unlock a <strong>5% Multi-Bale Discount</strong>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-between items-center text-sm font-black text-foreground">
                <span>Estimated Total</span>
                <span className="text-xl font-mono">£{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary min-h-[48px]">
              <span>Proceed to Checkout</span>
              <FiArrowRight />
            </Link>

            <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex items-start gap-2">
                <FiTruck className="text-brand-red shrink-0 mt-0.5" />
                <span>UK cargo, international freight, or Bradford HQ pickup</span>
              </div>
              <div className="flex items-start gap-2">
                <FiShield className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Commercial export invoice on order completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
