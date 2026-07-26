import { ContactController } from '@/server/modules/contact/contact.controller';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return ContactController.markRead(params.id);
}
