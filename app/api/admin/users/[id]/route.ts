import { UsersController } from '@/server/modules/users/users.controller';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return UsersController.updateUser(params.id, req);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return UsersController.toggleSuspend(params.id);
}
