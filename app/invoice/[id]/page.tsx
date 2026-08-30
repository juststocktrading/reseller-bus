import { prisma } from '@/lib/db';
import { verifyInvoiceToken } from '@/lib/share-links';
import InvoiceDocument from '@/components/InvoiceDocument';
import InvoicePrintButton from '@/components/InvoicePrintButton';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
  searchParams: { token?: string };
}

// Public, no-login invoice view — reachable only with the signed token an admin
// generates via "Share" in the Orders tab. Deliberately selects a minimal, safe
// subset of user fields (no password hash, reset code, etc.).
export default async function PublicInvoicePage({ params, searchParams }: Props) {
  const token = searchParams.token || '';
  const valid = verifyInvoiceToken(params.id, token);

  if (!valid) {
    return <NotFound />;
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      shippingMethod: true,
      shippingCountry: true,
      shippingAddress: true,
      paymentMethod: true,
      stripePaymentId: true,
      carrierName: true,
      trackingNumber: true,
      totalAmount: true,
      shippingCost: true,
      createdAt: true,
      user: {
        select: { firstName: true, lastName: true, mobileNumber: true, email: true },
      },
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return <NotFound />;
  }

  const invoiceOrder: Order = {
    ...(order as any),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      product: { ...item.product, createdAt: item.product.createdAt.toISOString() } as any,
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-end mb-4 print:hidden">
        <InvoicePrintButton />
      </div>
      <InvoiceDocument order={invoiceOrder} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center text-muted-foreground text-sm">
      Invoice not found or this link is no longer valid.
    </div>
  );
}
