'use client';

import React from 'react';
import { Order } from '@/lib/types';
import InvoiceDocument from '@/components/InvoiceDocument';
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
        <InvoiceDocument order={order} />
      </div>
    </div>
  );
}
