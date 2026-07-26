import { AuthController } from '@/server/modules/auth/auth.controller';

export async function POST() {
  return AuthController.logout();
}
