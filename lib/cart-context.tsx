'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product } from './types';
import { AuthService } from '@/services/auth-service';
import { CartService } from '@/services/cart-service';

export interface LocalCartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: LocalCartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalItems: number;
  subtotal: number;
  bulkDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const isAuthed = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoaded = useRef(false);

  // Load guest cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reseller_bus_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      hasLoaded.current = true;
    }

    AuthService.getMe()
      .then((res) => {
        isAuthed.current = !!res.user;
      })
      .catch(() => {
        isAuthed.current = false;
      });
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reseller_bus_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Debounced sync of logged-in users' carts to the server (powers admin "Live Carts")
  useEffect(() => {
    if (!hasLoaded.current || !isAuthed.current) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      CartService.syncCart(
        cart.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      ).catch((e) => console.error('Failed to sync cart', e));
    }, 1000);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const itemCount = cart.length;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Bulk Multi-Bale Volume Discount: 3+ bales get 5% off
  const bulkDiscount = totalItems >= 3 ? subtotal * 0.05 : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalItems,
        subtotal,
        bulkDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
