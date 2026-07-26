'use client';

import React from 'react';
import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-10 sm:pt-12 safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <BrandLogo href="/" height={32} className="h-8 mb-8 opacity-95" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10">
        <div>
          <h4 className="text-sm font-bold tracking-widest uppercase mb-4 border-b border-white/10 pb-2 inline-block">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-white transition">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-widest uppercase mb-4 border-b border-white/10 pb-2 inline-block">
            Contact Us
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <FiMapPin className="text-brand-red mt-0.5 shrink-0" />
              <span>Unit 7, 5 Alive, York Road, Bradford BD8 0HR</span>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="text-brand-red shrink-0" />
              <a href="tel:+447344056285" className="hover:text-white transition">
                +44 7344 056285
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FiMail className="text-brand-red shrink-0" />
              <a
                href="mailto:info@resellerbus.co.uk"
                className="hover:text-white transition break-all"
              >
                info@resellerbus.co.uk
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/447353243741?text=Hello%2C%20I%27m%20interested%20in%20your%20wholesale%20clothing%20supply."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-whatsapp hover:brightness-110 font-medium"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-widest uppercase mb-4 border-b border-white/10 pb-2 inline-block">
            Follow Us
          </h4>
          <a
            href="https://tiktok.com/@resellerbus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
            aria-label="TikTok"
          >
            <FaTiktok className="text-lg" />
            <span>TikTok</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-6 text-xs text-white/50">
        © {new Date().getFullYear()} Reseller Bus. All rights reserved.
      </div>
    </footer>
  );
}
