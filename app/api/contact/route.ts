import { ContactController } from '@/server/modules/contact/contact.controller';

export async function POST(req: Request) {
  return ContactController.create(req);
}

export async function GET() {
  return ContactController.getAll();
}
