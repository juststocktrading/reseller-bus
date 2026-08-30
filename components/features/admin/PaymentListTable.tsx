'use client';

import React from 'react';
import { Payment } from '@/services/payment-service';
import ShareLinkMenu from './ShareLinkMenu';
import { FiCreditCard } from 'react-icons/fi';

interface Props {
  payments: Payment[];
}

export default function PaymentListTable({ payments }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
      <div>
        <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
          <FiCreditCard className="text-brand-red" /> Payment Records
        </h3>
        <p className="text-xs text-muted-foreground">Every Stripe payment attempt, successful or failed, tied to its order</p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs">No payments recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-muted-foreground">
            <thead className="bg-muted text-muted-foreground font-semibold uppercase text-[11px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Card</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/60 transition">
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-red">{p.orderNumber}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-card-foreground">
                      {p.order?.user?.firstName} {p.order?.user?.lastName}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{p.order?.user?.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                    £{p.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[11px]">
                    {p.cardBrand ? `${p.cardBrand} •••• ${p.cardLast4}` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${
                        p.status === 'SUCCEEDED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.status === 'FAILED' && p.failureReason && (
                      <div className="text-[10px] text-rose-500 mt-1 max-w-[180px]">{p.failureReason}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.receiptUrl ? (
                      <ShareLinkMenu
                        label="Receipt"
                        subject={`Payment Receipt — Order ${p.orderNumber}`}
                        message={(url) =>
                          `Hi ${p.order?.user?.firstName}, here's your Stripe payment receipt for order ${p.orderNumber}: ${url}`
                        }
                        whatsappPhone={
                          p.order?.user?.countryCode && p.order?.user?.mobileNumber
                            ? `${p.order.user.countryCode.replace('+', '')}${p.order.user.mobileNumber.replace(/^0/, '')}`
                            : undefined
                        }
                        getUrl={async () => p.receiptUrl!}
                      />
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">No receipt</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
