import { prisma } from '@/lib/db';
import { encrypt, decrypt, maskSecret } from '@/lib/crypto';
import { invalidateStripeSettingsCache } from '@/lib/stripe';
import { logAudit } from '@/lib/audit';

const SETTINGS_ID = 'default';

export class SettingsService {
  static async getStripeSettingsMasked() {
    const row = await prisma.paymentSettings.findUnique({ where: { id: SETTINGS_ID } });

    return {
      publishableKey: row?.publishableKey || null,
      hasSecretKey: !!row?.secretKey,
      secretKeyMasked: row?.secretKey ? maskSecret(decryptSafely(row.secretKey)) : null,
      hasWebhookSecret: !!row?.webhookSecret,
      webhookSecretMasked: row?.webhookSecret ? maskSecret(decryptSafely(row.webhookSecret)) : null,
      updatedAt: row?.updatedAt || null,
      updatedByName: row?.updatedByName || null,
    };
  }

  static async updateStripeSettings(
    data: { publishableKey?: string; secretKey?: string; webhookSecret?: string },
    adminName: string,
    adminId?: string
  ) {
    const publishableKey = data.publishableKey?.trim();
    const secretKey = data.secretKey?.trim();
    const webhookSecret = data.webhookSecret?.trim();

    if (publishableKey && !publishableKey.startsWith('pk_')) {
      throw new Error('Publishable key must start with "pk_"');
    }
    if (secretKey && !secretKey.startsWith('sk_')) {
      throw new Error('Secret key must start with "sk_"');
    }

    const updateData: Record<string, any> = { updatedByName: adminName };
    // Blank/omitted fields keep whatever is already stored — only overwrite what was actually provided.
    if (publishableKey) updateData.publishableKey = publishableKey;
    if (secretKey) updateData.secretKey = encrypt(secretKey);
    if (webhookSecret) updateData.webhookSecret = encrypt(webhookSecret);

    await prisma.paymentSettings.upsert({
      where: { id: SETTINGS_ID },
      update: updateData,
      create: { id: SETTINGS_ID, ...updateData },
    });

    invalidateStripeSettingsCache();

    await logAudit(
      'UPDATE_STRIPE_SETTINGS',
      `Stripe payment credentials updated by ${adminName}`,
      adminId
    );

    return this.getStripeSettingsMasked();
  }
}

// decrypt() throws on malformed payloads; guard the masking helper so a corrupted
// row can never crash the settings screen.
function decryptSafely(value: string): string {
  try {
    return decrypt(value);
  } catch {
    return '';
  }
}
