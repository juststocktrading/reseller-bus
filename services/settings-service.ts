import { apiClient } from './api-client';

export interface StripeSettings {
  publishableKey: string | null;
  hasSecretKey: boolean;
  secretKeyMasked: string | null;
  hasWebhookSecret: boolean;
  webhookSecretMasked: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
}

export class SettingsService {
  static async getStripeSettings() {
    return apiClient<{ settings: StripeSettings }>('/api/admin/settings/stripe');
  }

  static async updateStripeSettings(data: {
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  }) {
    return apiClient<{ success: boolean; settings: StripeSettings }>('/api/admin/settings/stripe', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
