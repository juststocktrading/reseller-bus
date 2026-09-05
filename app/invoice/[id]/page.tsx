import { prisma } from '@/lib/db';
import { verifyInvoiceToken } from '@/lib/share-links';
import InvoiceDocument from '@/components/InvoiceDocument';
import InvoicePrintButton from '@/components/InvoicePrintButton';
import { Order } from '@/lib/types';
import { FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
  searchParams: { token?: string; welcome?: string };
}

// Public, no-login invoice/receipt view — reachable either via the signed link an
// admin generates via "Share" in the Orders tab, or as the checkout success page
// a customer lands on right after paying (?welcome=1 adds the confirmation banner).
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

  const justPaid = searchParams.welcome === '1';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {justPaid && (
        <div className="bg-card border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl text-center print:hidden">
          <FiCheckCircle className="text-5xl sm:text-6xl text-emerald-400 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-black text-white">Order Confirmed!</h2>
          <p className="text-xs sm:text-sm text-muted-foreground break-words">
            Thank you for your order with Reseller Bus. Your receipt is below — save or print it for your records.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <InvoicePrintButton />
            <Link
              href="/account"
              className="bg-muted hover:bg-border text-foreground font-bold text-xs px-6 py-3.5 rounded-xl min-h-[48px] flex items-center justify-center"
            >
              View Order in Customer Portal
            </Link>
          </div>
        </div>
      )}

      {!justPaid && (
        <div className="flex items-center justify-end print:hidden">
          <InvoicePrintButton />
        </div>
      )}

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
