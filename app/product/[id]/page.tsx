'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProductService } from '@/services/product-service';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import ProfitCalculatorModal from '@/components/ProfitCalculatorModal';
import { FiShoppingBag, FiTrendingUp, FiCheck, FiTruck, FiShield, FiArrowLeft, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ProductService.getProductById(id as string)
      .then((data) => {
        setProduct(data.product);
        try {
          const imgs =
            typeof data.product.images === 'string'
              ? JSON.parse(data.product.images)
              : data.product.images;
          setSelectedImg(imgs[0] || '');
        } catch {
          setSelectedImg('');
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-24 text-muted-foreground animate-pulse px-4">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
        <Link href="/shop" className="link-text justify-center">
          Return to Shop Catalog
        </Link>
      </div>
    );
  }

  let images: string[] = [];
  try {
    images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  } catch {
    images = [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    ];
  }

  const estPiecesNumber = parseInt(product.estimatedPieces) || 180;
  const costPerPiece = product.avgCostPerPiece || (product.price / estPiecesNumber).toFixed(2);

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappMessage = `Hello, I'm interested in ordering the wholesale bale: ${product.title} (£${product.price})`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition min-h-[44px]"
      >
        <FiArrowLeft />
        <span>Back to Shop</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        <div className="lg:col-span-6 space-y-3 sm:space-y-4 min-w-0">
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border">
            <Image
              src={
                selectedImg ||
                images[0] ||
                'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80'
              }
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.isPreOrder && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <FiClock /> Pre-Order
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 shrink-0 snap-start transition ${
                    selectedImg === img ? 'border-brand-red scale-105' : 'border-border opacity-70'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-5 sm:space-y-6 min-w-0">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 border border-red-100 px-3 py-1 rounded-full">
              {product.category?.name || 'Wholesale Clothing Bale'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-3 leading-tight">
              {product.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center gap-2">
              <FiShield className="text-brand-red text-sm shrink-0" />
              <span>{product.grade}</span>
            </p>
          </div>

          <div className="bg-muted border border-border p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold block">
                Wholesale Price
              </span>
              <div className="text-3xl font-black text-foreground">£{product.price.toFixed(2)}</div>
            </div>
            <button
              onClick={() => setShowCalc(true)}
              className="bg-background hover:bg-accent text-foreground px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-border transition min-h-[44px] w-full sm:w-auto"
            >
              <FiTrendingUp className="text-base" />
              <span>Calculate Profit</span>
            </button>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-border text-sm grid grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Bale Weight
              </span>
              <span className="font-bold text-foreground text-sm">
                {product.weightKg || 50} KG
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Est. Pieces
              </span>
              <span className="font-bold text-foreground text-sm">{product.estimatedPieces}</span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Est. Cost / Piece
              </span>
              <span className="font-bold text-emerald-700 text-sm">~£{costPerPiece}</span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block">
                Stock Status
              </span>
              <span className="font-bold text-foreground text-sm">
                {product.stockCount > 0 ? `${product.stockCount} Available` : 'Pre-Order Only'}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <label className="text-sm text-foreground font-semibold">Quantity:</label>
              <div className="flex items-center border border-border rounded-xl bg-muted overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-foreground hover:bg-accent font-bold min-h-[44px] min-w-[44px]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-foreground hover:bg-accent font-bold min-h-[44px] min-w-[44px]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition min-h-[48px] ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {added ? (
                  <>
                    <FiCheck className="text-lg" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <FiShoppingBag className="text-lg" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/447353243741?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-whatsapp hover:brightness-110 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 min-h-[48px]"
              >
                <FaWhatsapp className="text-lg" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="border-t border-border pt-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <h4 className="font-bold text-foreground uppercase text-xs">Description</h4>
            <p>{product.description}</p>
            <div className="bg-muted p-3 rounded-xl border border-border text-xs text-muted-foreground flex items-start gap-2">
              <FiTruck className="text-brand-red text-base shrink-0 mt-0.5" />
              <span>
                Delivery available to UK (£20), Ghana (£50), Nigeria (£60), Gambia (£80) or Bradford HQ
                pickup.
              </span>
            </div>
          </div>
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
