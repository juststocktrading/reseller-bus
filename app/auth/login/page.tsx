'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth-service';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import BrandLogo from '@/components/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login(email, password);
      router.push('/account');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-card border border-border p-5 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo href="/" height={36} className="h-9" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-card-foreground pt-2">Reseller Sign In</h1>
          <p className="text-xs text-muted-foreground">Access your wholesale orders and trade account</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-3.5 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[48px]"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary min-h-[48px]">
            <span>{loading ? 'Signing In...' : 'Sign In to Account'}</span>
            <FiArrowRight />
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
          Don't have a reseller account?{' '}
          <Link href="/auth/register" className="text-brand-red font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
