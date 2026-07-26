import React from 'react';
import Link from 'next/link';
import { FiShield, FiGlobe } from 'react-icons/fi';

export const metadata = {
  title: 'About | Reseller Bus',
  description:
    'Bridging the gap between UK quality stocks and resellers worldwide with premium cream grade clothing and liquidation stock.',
};

export default function AboutPage() {
  const values = [
    {
      title: 'Trust & Transparency',
      desc: 'We build lasting relationships through honest communication and clear processes.',
    },
    {
      title: 'Premium Quality',
      desc: 'Every item is carefully inspected to ensure it meets our high standards.',
    },
    {
      title: 'Reseller Success',
      desc: "We're invested in your growth — your success is our success.",
    },
    {
      title: 'Sustainability',
      desc: 'Giving quality clothing a second life through responsible sourcing.',
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-background text-foreground">
      <section className="bg-primary text-primary-foreground py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <p className="text-sm font-medium text-white/70">About Reseller Bus</p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Your Strategic UK Partner for Quality Clothing
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Specialising in sourcing quality cream grade clothing and liquidation stock for resale
            markets in the UK, Ghana, Nigeria, Gambia, and Europe.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Link href="/shop" className="btn-hero w-full sm:w-auto">
              Browse Our Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center font-medium text-sm py-3 px-8 rounded-lg border border-white/20 text-white hover:bg-white/10 transition min-h-[44px] w-full sm:w-auto"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-muted rounded-2xl p-8 space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
          <h2 className="text-2xl font-bold text-card-foreground">Who We Are</h2>
          <p>
            Reseller Bus was established to bridge the gap between UK quality stocks and resellers
            seeking reliable wholesale goods. We specialise in sourcing quality cream grade clothing
            and liquidation stock for resale markets worldwide.
          </p>
          <p>
            We are not simply wholesalers. We are your strategic sourcing partner — ensuring
            transparency, efficiency, and reliability at every step of the procurement and export
            process.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center min-w-0">
            <div className="text-xl sm:text-3xl font-bold text-card-foreground">500+</div>
            <div className="text-[11px] sm:text-sm text-muted-foreground leading-snug">Happy Customers</div>
          </div>
          <div className="text-center min-w-0">
            <div className="text-xl sm:text-3xl font-bold text-card-foreground">98%</div>
            <div className="text-[11px] sm:text-sm text-muted-foreground leading-snug">Satisfaction Rate</div>
          </div>
          <div className="text-center min-w-0">
            <div className="text-xl sm:text-3xl font-bold text-card-foreground">6 Yrs</div>
            <div className="text-[11px] sm:text-sm text-muted-foreground leading-snug">In Business</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-3">
            <div className="bg-muted text-foreground p-3 rounded-lg w-fit">
              <FiShield className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To empower resellers worldwide with access to premium quality UK stock at competitive
              prices, fostering sustainable trade relationships that drive mutual growth.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 space-y-3">
            <div className="bg-muted text-foreground p-3 rounded-lg w-fit">
              <FiGlobe className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground">Our Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To become the most trusted bridge between UK surplus stock and global resale markets,
              known for quality, integrity, and exceptional service.
            </p>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground p-8 md:p-12 rounded-2xl space-y-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight">Our Guiding Commitments</h2>
            <p className="text-sm text-white/60">
              The principles that guide every decision we make in procurement and global logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-2">
                <h4 className="font-bold text-sm">{v.title}</h4>
                <p className="text-sm text-white/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
