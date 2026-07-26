'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { FiPrinter, FiX, FiGlobe, FiFileText } from 'react-icons/fi';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportInvoiceModal({ order, isOpen, onClose }: Props) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full p-8 shadow-2xl relative text-card-foreground my-8">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6 print:hidden">
          <div className="flex items-center space-x-2">
            <FiFileText className="text-brand-red text-xl" />
            <h3 className="text-lg font-bold">Customs Commercial Export Invoice</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
            >
              <FiPrinter />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2 rounded-lg bg-muted"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="bg-white text-slate-950 p-8 rounded-xl shadow font-sans text-xs print:p-0 print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.jpg" alt="Reseller Bus" className="h-8 w-auto" />
              <p className="text-slate-600 font-medium">Reseller Bus</p>
              <p className="text-slate-500">Unit 7, 5 Alive, York Road</p>
              <p className="text-slate-500">Bradford BD8 0HR, United Kingdom</p>
              <p className="text-slate-500">VAT / EORI Registered | Phone: +44 7344 056285</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-100 text-slate-900 px-3 py-1.5 rounded font-mono font-bold text-sm mb-2 border">
                INVOICE #: {order.orderNumber}
              </div>
              <p className="text-slate-600">Date: {new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
              <p className="text-slate-600">HS Code: <strong className="font-mono">6309.00.00</strong> (Worn Clothing Bales)</p>
              <p className="text-slate-600 font-semibold text-emerald-700">Status: {order.status}</p>
            </div>
          </div>

          {/* Consignee & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-slate-50 rounded border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Consignee / Buyer:</h4>
              <p className="font-bold text-slate-800">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-slate-600 whitespace-pre-line">{order.shippingAddress}</p>
              <p className="text-slate-600">Country: <strong>{order.shippingCountry}</strong></p>
              <p className="text-slate-600">Mobile: {order.user?.mobileNumber}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Shipment Information:</h4>
              <p className="text-slate-600">Method: <strong>{order.shippingMethod}</strong></p>
              <p className="text-slate-600">Carrier: <strong>{order.carrierName || 'Standard Freight Cargo'}</strong></p>
              <p className="text-slate-600">Tracking #: <strong>{order.trackingNumber || 'Pending Dispatch'}</strong></p>
              <p className="text-slate-600">Payment Ref: <strong>{order.paymentMethod} / {order.stripePaymentId || 'CONFIRMED'}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[11px] bg-slate-100">
                <th className="py-2.5 px-3">Description of Goods</th>
                <th className="py-2.5 px-3 text-center">Bale Weight</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Amount (GBP £)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{item.product?.title}</p>
                    <p className="text-[10px] text-slate-500">{item.product?.grade} • Est: {item.product?.estimatedPieces}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{item.product?.weightKg || 50} KG</td>
                  <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">£{item.price.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">£{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-1.5 text-right border-t border-slate-300 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">£{(order.totalAmount - order.shippingCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight & Logistics:</span>
                <span className="font-mono font-semibold">£{order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t-2 border-slate-900">
                <span>Total Payable:</span>
                <span className="font-mono text-emerald-700">£{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 leading-relaxed">
            <p className="font-bold text-slate-700 mb-1">Exporter Declaration:</p>
            <p>
              We declare that the invoice shows the actual price of the goods described and that all particulars are true and correct. These wholesale garments are exported for trade/resale purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
