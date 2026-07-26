'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth-service';
import { sanitizeDigits } from '@/lib/input-utils';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import BrandLogo from '@/components/BrandLogo';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await AuthService.register({
        firstName,
        lastName,
        email,
        countryCode,
        mobileNumber,
        password,
      });

      router.push('/account');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
      <div className="bg-card border border-border p-5 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo href="/" height={36} className="h-9" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-card-foreground pt-2">Register Trade Account</h1>
          <p className="text-xs text-muted-foreground">Join hundreds of resellers sourcing premium UK 50kg bales</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-foreground font-semibold mb-1">First Name</label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-foreground font-semibold mb-1">Last Name</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="reseller@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-1">Mobile Phone Number</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
              >
                <option value="+44">🇬🇧 +44 (UK)</option>
                <option value="+233">🇬🇭 +233 (Ghana)</option>
                <option value="+234">🇳🇬 +234 (Nigeria)</option>
                <option value="+220">🇬🇲 +220 (Gambia)</option>
                <option value="+49">🇩🇪 +49 (Germany)</option>
              </select>
              <input
                type="tel"
                inputMode="numeric"
                required
                placeholder="7344056285"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(sanitizeDigits(e.target.value))}
                className="sm:col-span-2 bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-foreground font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-foreground font-semibold mb-1">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-h-[48px]"
          >
            <span>{loading ? 'Creating Account...' : 'Create Trade Account'}</span>
            <FiArrowRight />
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-red font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
