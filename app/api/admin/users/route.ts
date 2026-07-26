import { UsersController } from '@/server/modules/users/users.controller';

export async function GET() {
  return UsersController.getAllUsers();
}

export async function POST(req: Request) {
  return UsersController.createUser(req);
}
