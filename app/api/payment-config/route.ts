import { NextResponse } from 'next/server';
import { getPaymentSettings } from '@/lib/stripe';

// Public, unauthenticated endpoint — a Stripe publishable key is designed to be
// exposed client-side, so the checkout page can fetch it at runtime instead of
// baking it into the build via NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
//
// Force this route to always execute (never statically cached): it reads
// admin-configurable settings from the DB, and a rotated key must take effect
// immediately rather than being masked by Next's default Route Handler caching.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getPaymentSettings();
    return NextResponse.json({
      publishableKey: settings.publishableKey || null,
      configured: !!settings.secretKey && !!settings.publishableKey,
    });
  } catch (error: any) {
    return NextResponse.json({ publishableKey: null, configured: false });
  }
}
