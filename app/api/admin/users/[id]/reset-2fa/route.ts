import { UsersController } from '@/server/modules/users/users.controller';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return UsersController.reset2FA(params.id);
}
