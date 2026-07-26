'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { FiShoppingBag, FiTrendingUp, FiCheck } from 'react-icons/fi';
import { Zap } from 'lucide-react';
import ProfitCalculatorModal from '@/components/ProfitCalculatorModal';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  let images: string[] = [];
  try {
    images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  } catch {
    images = ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80'];
  }

  const mainImage =
    images[0] ||
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    router.push('/checkout');
  };

  const estPiecesNumber = parseInt(product.estimatedPieces) || 180;

  return (
    <div className="group brand-card overflow-hidden flex flex-col">
      <div className="relative">
        <Link href={`/product/${product.id}`} className="block aspect-square bg-muted relative overflow-hidden">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>
        <div className="absolute bottom-0 left-0 h-0.5 w-0 brand-accent-bar transition-all duration-300 group-hover:w-full" />
        {product.category?.name && (
          <span className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-semibold uppercase px-2.5 py-1 rounded">
            {product.category.name}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-card-foreground group-hover:text-foreground transition-colors line-clamp-2 text-base leading-snug">
              {product.title}
            </h3>
          </Link>
          <button
            onClick={() => setShowCalc(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground shrink-0"
            title="Reseller Profit Calculator"
            aria-label="Profit calculator"
          >
            <FiTrendingUp className="text-base" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">£{product.price.toFixed(2)}</p>

        <div className="flex flex-col gap-2 mt-auto pt-1">
          <button type="button" onClick={handleBuyNow} className="btn-primary">
            <Zap className="w-4 h-4" aria-hidden="true" />
            Buy Now
          </button>
          <button type="button" onClick={handleAdd} disabled={added} className="btn-outline">
            {added ? (
              <>
                <FiCheck className="w-4 h-4" />
                Added
              </>
            ) : (
              <>
                <FiShoppingBag className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      <ProfitCalculatorModal
        isOpen={showCalc}
        onClose={() => setShowCalc(false)}
        initialPrice={product.price}
        initialPieces={estPiecesNumber}
      />
    </div>
  );
}
