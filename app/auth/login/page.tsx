'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth-service';
import { FiLock, FiMail, FiArrowRight, FiShield, FiCheckCircle, FiUser } from 'react-icons/fi';
import BrandLogo from '@/components/BrandLogo';

const REMEMBERED_EMAIL_KEY = 'rb_remembered_email';

type Step =
  | { name: 'credentials' }
  | { name: 'setup-qr'; pendingToken: string; qrDataUrl: string; secretForManualEntry: string }
  | { name: 'setup-backup-codes'; backupCodes: string[] }
  | { name: 'verify-2fa'; pendingToken: string };

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: 'credentials' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const remembered = typeof window !== 'undefined' ? localStorage.getItem(REMEMBERED_EMAIL_KEY) : null;
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
      setIsReturning(true);
    }
  }, []);

  const finishLogin = () => {
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
    router.push('/account');
    router.refresh();
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await AuthService.login(email, password);

      if ('requiresSetup' in result) {
        setStep({
          name: 'setup-qr',
          pendingToken: result.pendingToken,
          qrDataUrl: result.qrDataUrl,
          secretForManualEntry: result.secretForManualEntry,
        });
      } else if ('requires2FA' in result) {
        setStep({ name: 'verify-2fa', pendingToken: result.pendingToken });
      } else {
        finishLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step.name !== 'setup-qr') return;
    setError('');
    setLoading(true);

    try {
      const res = await AuthService.confirm2FASetup(step.pendingToken, code);
      setStep({ name: 'setup-backup-codes', backupCodes: res.backupCodes });
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step.name !== 'verify-2fa') return;
    setError('');
    setLoading(true);

    try {
      await AuthService.verify2FA(step.pendingToken, code);
      finishLogin();
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const useDifferentAccount = () => {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    setIsReturning(false);
    setEmail('');
    setPassword('');
    setRememberMe(false);
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

        {/* Step: Credentials (full form, or condensed "returning user" view) */}
        {step.name === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
            {isReturning ? (
              <div className="bg-muted border border-border rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FiUser className="text-brand-red shrink-0" />
                  <span className="font-semibold text-foreground truncate">Continue as {email}</span>
                </div>
                <button type="button" onClick={useDifferentAccount} className="text-brand-red font-bold hover:underline shrink-0">
                  Not you?
                </button>
              </div>
            ) : (
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
            )}

            <div>
              <label className="block text-foreground font-semibold mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  autoFocus={isReturning}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[48px]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-foreground font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-brand-red"
              />
              Remember me on this device
            </label>

            <button type="submit" disabled={loading} className="btn-primary min-h-[48px]">
              <span>{loading ? 'Signing In...' : 'Sign In to Account'}</span>
              <FiArrowRight />
            </button>
          </form>
        )}

        {/* Step: First-time 2FA setup (STAFF/ADMIN/SUPER_ADMIN only) */}
        {step.name === 'setup-qr' && (
          <form onSubmit={handleSetupConfirm} className="space-y-4 text-xs">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl flex items-start gap-2">
              <FiShield className="shrink-0 mt-0.5" />
              <span>
                Admin accounts require two-factor authentication. Scan this QR code with an authenticator app
                (Google Authenticator, Authy, etc.), then enter the 6-digit code it shows.
              </span>
            </div>

            <div className="flex justify-center bg-white p-3 rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.qrDataUrl} alt="2FA setup QR code" className="h-40 w-40" />
            </div>

            <div className="text-center text-muted-foreground">
              Can't scan? Enter this code manually:
              <div className="font-mono font-bold text-foreground bg-muted border border-border rounded-lg p-2 mt-1 break-all select-all">
                {step.secretForManualEntry}
              </div>
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">6-Digit Code</label>
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-muted border border-border rounded-xl p-3 text-center text-lg tracking-[0.4em] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[48px]"
              />
            </div>

            <button type="submit" disabled={loading || code.length !== 6} className="btn-primary min-h-[48px]">
              <span>{loading ? 'Verifying...' : 'Enable 2FA & Continue'}</span>
              <FiArrowRight />
            </button>
          </form>
        )}

        {/* Step: Show backup codes once, right after setup */}
        {step.name === 'setup-backup-codes' && (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl flex items-start gap-2">
              <FiShield className="shrink-0 mt-0.5" />
              <span>
                Save these one-time backup codes somewhere safe. Each can be used once to sign in if you lose
                access to your authenticator app. <strong>They will not be shown again.</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-muted border border-border rounded-xl p-4 font-mono font-bold text-foreground select-all">
              {step.backupCodes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>

            <button onClick={finishLogin} className="btn-primary min-h-[48px]">
              <span>I've saved these — Continue</span>
              <FiCheckCircle />
            </button>
          </div>
        )}

        {/* Step: Returning admin — verify TOTP (or backup) code */}
        {step.name === 'verify-2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-4 text-xs">
            <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-2 text-foreground font-semibold">
              <FiShield className="text-brand-red shrink-0" />
              Enter the code from your authenticator app
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">
                {useBackupCode ? 'Backup Code' : '6-Digit Code'}
              </label>
              <input
                type="text"
                required
                autoFocus
                inputMode={useBackupCode ? 'text' : 'numeric'}
                maxLength={useBackupCode ? 11 : 6}
                placeholder={useBackupCode ? 'XXXXX-XXXXX' : '123456'}
                value={code}
                onChange={(e) => setCode(useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ''))}
                className="w-full bg-muted border border-border rounded-xl p-3 text-center text-lg tracking-[0.3em] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[48px]"
              />
            </div>

            <button type="submit" disabled={loading || code.length === 0} className="btn-primary min-h-[48px]">
              <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
              <FiArrowRight />
            </button>

            <button
              type="button"
              onClick={() => {
                setUseBackupCode((v) => !v);
                setCode('');
                setError('');
              }}
              className="w-full text-center text-brand-red font-bold hover:underline"
            >
              {useBackupCode ? 'Use authenticator app code instead' : 'Use a backup code instead'}
            </button>
          </form>
        )}

        {step.name === 'credentials' && (
          <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
            Don't have a reseller account?{' '}
            <Link href="/auth/register" className="text-brand-red font-bold hover:underline">
              Register Here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
