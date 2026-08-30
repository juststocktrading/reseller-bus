import { PaymentsController } from '@/server/modules/payments/payments.controller';

export async function GET() {
  return PaymentsController.getPayments();
}
