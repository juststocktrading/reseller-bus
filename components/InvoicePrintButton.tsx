'use client';

import React from 'react';
import { FiPrinter } from 'react-icons/fi';

export default function InvoicePrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition print:hidden"
    >
      <FiPrinter />
      <span>Print / Download PDF</span>
    </button>
  );
}
