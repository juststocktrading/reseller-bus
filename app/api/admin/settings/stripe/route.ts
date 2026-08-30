import { SettingsController } from '@/server/modules/settings/settings.controller';

export async function GET() {
  return SettingsController.getStripeSettings();
}

export async function PUT(req: Request) {
  return SettingsController.updateStripeSettings(req);
}
