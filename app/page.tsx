import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductsService } from '@/server/modules/products/products.service';
import ProductCard from '@/components/features/products/ProductCard';
import { FiArrowRight, FiShield, FiTruck, FiCheckCircle } from 'react-icons/fi';

export const revalidate = 0;

export default async function HomePage() {
  let products: any[] = [];
  try {
    const data = await ProductsService.getAll();
    products = data.slice(0, 3);
  } catch {
    products = [];
  }

  const reviews = [
    {
      text: 'I run a boutique in Accra and the mixed women clothing bales from Reseller Bus changed my business. The variety is incredible — skirts, blouses, undies — all cream grade and sellable. My customers keep coming back.',
      author: 'Ama Adjei',
      role: 'Boutique Owner, Accra, Ghana',
      initials: 'AA',
    },
    {
      text: 'I was sourcing from three different suppliers before. Now I get everything from one place. The kids clothing bales are consistently high quality and the pricing leaves me healthy margins.',
      author: 'David Kalu',
      role: 'Reseller, Lagos, Nigeria',
      initials: 'DK',
    },
    {
      text: 'Delivery to Banjul took just under two weeks and the shipping was trackable the whole way. The 25KG bales were packed securely. I\'ve already placed my second order.',
      author: 'Marie Bah',
      role: 'Fashion Retailer, Banjul, Gambia',
      initials: 'MB',
    },
    {
      text: 'The general mix bales are perfect for my market stall. I get men\'s, women\'s and kids items in one go. The ladies outnumber the men which is exactly what my customers want.',
      author: 'Emeka Okafor',
      role: 'Market Trader, Onitsha, Nigeria',
      initials: 'EO',
    },
    {
      text: 'I compared five UK wholesalers before settling on Reseller Bus. Their cream grade is better than some suppliers\' premium. The winter mix with hoodies and jackets flew off my shelves.',
      author: 'Chloe Lambert',
      role: 'Online Reseller, Birmingham, UK',
      initials: 'CL',
    },
    {
      text: 'My shop specialises in ladieswear and the 55KG women\'s bale is exceptional value. Dresses, tops, trousers — all sorted by size. Saves me hours of sorting time.',
      author: 'Fatima Ndao',
      role: 'Fashion Boutique Owner, Dakar, Senegal',
      initials: 'FN',
    },
  ];

  return (
    <div className="pb-10 bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden text-white min-h-[70vh] sm:min-h-[75vh] flex items-end sm:items-center">
        <Image
          src="/images/hero-bg-mobile.png"
          alt="Family wearing quality wholesale clothing"
          fill
          priority
          className="object-cover object-center lg:hidden"
          sizes="100vw"
        />
        <Image
          src="/images/hero-bg.png"
          alt="Family wearing quality wholesale clothing"
          fill
          priority
          className="object-cover object-center hidden lg:block"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="relative z-10 w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-14 sm:py-20 md:py-24 lg:py-28 xl:py-32"
          style={{ maxWidth: 'min(90rem, 100%)' }}
        >
          <h1
            className="font-black tracking-tight leading-tight text-white"
            style={{
              fontSize: 'clamp(1.75rem, 10vw, 3.5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            THE SELLER
            <br />
            RESELLERS TRUST
          </h1>
          <p
            className="text-white/90 mt-3 sm:mt-4"
            style={{
              fontSize: 'clamp(0.85rem, 3vw, 1.1rem)',
              lineHeight: 1.65,
              maxWidth: 'min(32rem, 90%)',
            }}
          >
            Premium cream grade clothing and New with Tags stock. Quality-checked, Trusted, and Ready
            to ship.
          </p>
          <Link href="/shop" className="btn-hero mt-6 sm:mt-8">
            SHOP NOW
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 pb-10">
        {/* Best Sellers */}
        <section className="py-10 sm:py-16">
          <div className="mb-6 sm:mb-8 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-card-foreground">Best Sellers</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Shop the Latest Styles: Stay ahead of the curve with our best sellers
              </p>
            </div>
            <Link href="/shop" className="link-text hidden sm:flex ml-4">
              All products
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Products coming soon.</p>
          )}

          <div className="mt-6 sm:hidden">
            <Link href="/shop" className="link-text">
              All products
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* About + Stats */}
        <section className="py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-5">
            <p className="text-sm font-medium text-muted-foreground">About Reseller Bus</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-card-foreground leading-tight">
              Your Strategic UK Partner for Quality Clothing
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Reseller Bus was established to bridge the gap between UK quality stocks and resellers
              seeking reliable wholesale goods. We specialise in sourcing quality cream grade clothing
              and liquidation stock for resale markets worldwide.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We are not simply wholesalers. We are your strategic sourcing partner — ensuring
              transparency, efficiency, and reliability at every step of the procurement and export
              process.
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
              <div className="text-center sm:text-left min-w-0">
                <div className="text-xl sm:text-3xl font-bold text-card-foreground">500+</div>
                <div className="text-[11px] sm:text-sm text-muted-foreground leading-snug">Happy Customers</div>
              </div>
              <div className="text-center sm:text-left min-w-0">
                <div className="text-xl sm:text-3xl font-bold text-card-foreground">98%</div>
                <div className="text-[11px] sm:text-sm text-muted-foreground leading-snug">Satisfaction Rate</div>
              </div>
              <div className="text-center sm:text-left min-w-0">
                <div className="text-xl sm:text-3xl font-bold text-card-foreground">6 Yrs</div>
                <div className="text-[11px] sm:text-sm text-muted-foreground leading-snug">In Business</div>
              </div>
            </div>

            <Link href="/shop" className="btn-pill mt-2">
              Browse Our Products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted rounded-xl p-5 sm:p-6 space-y-3 sm:col-span-2">
              <FiShield className="text-2xl text-foreground" />
              <h3 className="text-lg font-bold text-card-foreground">Quality Sourcing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Carefully selected cream grade and liquidation stock from trusted UK suppliers.
              </p>
            </div>
            <div className="bg-muted rounded-xl p-5 sm:p-6 space-y-3">
              <FiCheckCircle className="text-2xl text-foreground" />
              <h3 className="text-lg font-bold text-card-foreground">Trusted Process</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transparent procurement and reliable export to markets worldwide.
              </p>
            </div>
            <div className="bg-muted rounded-xl p-5 sm:p-6 space-y-3">
              <FiTruck className="text-2xl text-foreground" />
              <h3 className="text-lg font-bold text-card-foreground">Global Delivery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Delivery available within the UK, Ghana, Nigeria, Gambia and all over Europe.
              </p>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-12 sm:py-16">
          <div className="text-center space-y-2 max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-card-foreground px-1">
              What Our Customers Say
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Real reviews from people who love our products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.initials + r.author} className="brand-card p-6 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground leading-relaxed italic">“{r.text}”</p>
                <div className="flex items-center gap-3 pt-5 mt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {r.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-card-foreground">{r.author}</div>
                    <div className="text-xs text-muted-foreground">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
