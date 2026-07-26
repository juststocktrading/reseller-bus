import { AuthController } from '@/server/modules/auth/auth.controller';

export async function GET() {
  return AuthController.me();
}
