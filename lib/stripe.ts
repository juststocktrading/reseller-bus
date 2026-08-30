import Stripe from 'stripe';
import { prisma } from './db';
import { decrypt } from './crypto';

const SETTINGS_ID = 'default';
const CACHE_TTL_MS = 30_000;

interface DecryptedSettings {
  publishableKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
  updatedAt: Date | null;
  updatedByName: string | null;
}

let cache: { value: DecryptedSettings; expiresAt: number } | null = null;
let stripeClient: { client: Stripe; secretKey: string } | null = null;

async function loadSettings(): Promise<DecryptedSettings> {
  const row = await prisma.paymentSettings.findUnique({ where: { id: SETTINGS_ID } });
  return {
    publishableKey: row?.publishableKey || null,
    secretKey: row?.secretKey ? decrypt(row.secretKey) : null,
    webhookSecret: row?.webhookSecret ? decrypt(row.webhookSecret) : null,
    updatedAt: row?.updatedAt || null,
    updatedByName: row?.updatedByName || null,
  };
}

/** Cached (short TTL) read of the decrypted payment settings row. */
export async function getPaymentSettings(): Promise<DecryptedSettings> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  const value = await loadSettings();
  cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

/** Called after the admin saves new Stripe credentials so subsequent requests pick them up immediately. */
export function invalidateStripeSettingsCache() {
  cache = null;
  stripeClient = null;
}

export async function getStripe(): Promise<Stripe> {
  const settings = await getPaymentSettings();
  if (!settings.secretKey) {
    throw new Error('Stripe is not configured. Add your API keys in Admin > Payment Settings.');
  }
  if (!stripeClient || stripeClient.secretKey !== settings.secretKey) {
    stripeClient = {
      client: new Stripe(settings.secretKey, { apiVersion: '2024-06-20' }),
      secretKey: settings.secretKey,
    };
  }
  return stripeClient.client;
}

export async function getStripeWebhookSecret(): Promise<string | null> {
  const settings = await getPaymentSettings();
  return settings.webhookSecret;
}

export async function isStripeConfigured(): Promise<boolean> {
  const settings = await getPaymentSettings();
  return !!settings.secretKey;
}
