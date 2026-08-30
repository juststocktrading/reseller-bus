'use client';

import React, { useState, useEffect } from 'react';
import { SettingsService, StripeSettings } from '@/services/settings-service';
import { FiKey, FiCheckCircle, FiAlertTriangle, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';

export default function PaymentSettingsPanel() {
  const [settings, setSettings] = useState<StripeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/stripe` : '';

  const load = async () => {
    setLoading(true);
    try {
      const res = await SettingsService.getStripeSettings();
      setSettings(res.settings);
      setPublishableKey(res.settings.publishableKey || '');
    } catch (e: any) {
      setError(e.message || 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await SettingsService.updateStripeSettings({
        publishableKey,
        // Blank = leave the currently stored value untouched.
        secretKey: secretKey || undefined,
        webhookSecret: webhookSecret || undefined,
      });
      setSettings(res.settings);
      setSecretKey('');
      setWebhookSecret('');
      setSuccess('Stripe payment settings saved.');
    } catch (e: any) {
      setError(e.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const configured = settings?.hasSecretKey && settings?.publishableKey;

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground text-xs animate-pulse">Loading payment settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div
        className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
          configured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}
      >
        {configured ? <FiCheckCircle className="text-base shrink-0" /> : <FiAlertTriangle className="text-base shrink-0" />}
        <span>
          {configured
            ? `Stripe is configured. Card payments are live at checkout.${settings?.updatedByName ? ` Last updated by ${settings.updatedByName}.` : ''}`
            : 'Stripe is not configured yet. Checkout payments will fail until you add both keys below.'}
        </span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
          <FiKey className="text-brand-red" /> Stripe API Credentials
        </h3>
        <p className="text-xs text-muted-foreground -mt-4">
          From your Stripe Dashboard → Developers → API keys. These are stored encrypted in the database — no
          server environment variables needed.
        </p>

        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold">{success}</div>}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">Publishable Key</label>
            <input
              type="text"
              placeholder="pk_live_... or pk_test_..."
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              className="w-full bg-muted border border-border p-2.5 rounded font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-1">
              Secret Key {settings?.hasSecretKey && <span className="text-muted-foreground font-normal">(currently {settings.secretKeyMasked})</span>}
            </label>
            <input
              type="password"
              placeholder={settings?.hasSecretKey ? 'Leave blank to keep current key' : 'sk_live_... or sk_test_...'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-muted border border-border p-2.5 rounded font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-1">
              Webhook Signing Secret {settings?.hasWebhookSecret && <span className="text-muted-foreground font-normal">(currently {settings.webhookSecretMasked})</span>}
            </label>
            <input
              type="password"
              placeholder={settings?.hasWebhookSecret ? 'Leave blank to keep current secret' : 'whsec_...'}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full bg-muted border border-border p-2.5 rounded font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Stripe Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-card-foreground">Webhook Setup</h3>
        <p className="text-xs text-muted-foreground">
          In Stripe Dashboard → Developers → Webhooks, add an endpoint with this URL and select the{' '}
          <code className="bg-muted px-1 py-0.5 rounded">payment_intent.succeeded</code> and{' '}
          <code className="bg-muted px-1 py-0.5 rounded">payment_intent.payment_failed</code> events. Then paste the
          "Signing secret" it gives you into the field above.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-muted border border-border p-2.5 rounded text-[11px] font-mono text-foreground break-all">
            {webhookUrl}
          </code>
          <button
            onClick={handleCopyWebhook}
            className="bg-muted hover:bg-border text-foreground p-2.5 rounded shrink-0"
            title="Copy webhook URL"
          >
            {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
          </button>
        </div>
        <a
          href="https://dashboard.stripe.com/webhooks"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-brand-red font-semibold hover:underline text-xs"
        >
          Open Stripe Webhooks Dashboard <FiExternalLink />
        </a>
      </div>
    </div>
  );
}
