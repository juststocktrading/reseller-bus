import { AuditController } from '@/server/modules/audit/audit.controller';

export async function GET() {
  return AuditController.getLogs();
}
