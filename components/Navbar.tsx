'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '@/lib/cart-context';
import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; role: string } | null>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-14 sm:h-16 md:h-20 min-w-0">
          <div className="max-w-[58%] sm:max-w-none min-w-0">
            <BrandLogo priority className="h-8 sm:h-9 md:h-10 [&_img]:max-h-full" height={40} />
          </div>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors uppercase tracking-wide ${
                  pathname === link.href
                    ? 'text-foreground border-b-2 border-foreground pb-0.5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition p-2 min-h-[44px] min-w-[44px] justify-center"
                  aria-label="Account"
                >
                  <FiUser className="text-base" />
                  <span className="hidden sm:inline">{user.firstName}</span>
                </Link>
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium uppercase transition hover:opacity-90"
                  >
                    Admin
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition p-2 min-h-[44px] min-w-[44px] justify-center"
                aria-label="Sign In"
              >
                <FiUser className="text-base" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-muted-foreground transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="View Cart"
            >
              <FiShoppingBag className="text-xl" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-red text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 z-40 bg-background overflow-y-auto border-t border-border">
          <nav className="px-4 py-4 space-y-1 pb-24">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3.5 rounded-lg text-base font-black uppercase tracking-tight min-h-[48px] ${
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user &&
              (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3.5 rounded-lg text-base font-black uppercase tracking-tight text-foreground hover:bg-muted min-h-[48px]"
                >
                  Admin
                </Link>
              )}
          </nav>
        </div>
      )}
    </header>
  );
}
