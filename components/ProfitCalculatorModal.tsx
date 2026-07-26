'use client';

import React, { useState } from 'react';
import { FiX, FiTrendingUp, FiDollarSign, FiPercent } from 'react-icons/fi';
import { sanitizeDigits, sanitizeDecimal } from '@/lib/input-utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialPrice?: number;
  initialPieces?: number;
}

export default function ProfitCalculatorModal({
  isOpen,
  onClose,
  initialPrice = 500,
  initialPieces = 180,
}: Props) {
  const [balePrice, setBalePrice] = useState<number>(initialPrice);
  const [estimatedPieces, setEstimatedPieces] = useState<number>(initialPieces);
  const [sellingPricePerPiece, setSellingPricePerPiece] = useState<number>(15);

  if (!isOpen) return null;

  const costPerPiece = estimatedPieces > 0 ? (balePrice / estimatedPieces).toFixed(2) : '0.00';
  const totalRevenue = (estimatedPieces * sellingPricePerPiece).toFixed(2);
  const netProfit = (estimatedPieces * sellingPricePerPiece - balePrice).toFixed(2);
  const marginPercent =
    balePrice > 0 ? (((estimatedPieces * sellingPricePerPiece - balePrice) / (estimatedPieces * sellingPricePerPiece)) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-card-foreground max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-2 rounded-lg bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <FiX className="text-xl" />
        </button>

        <div className="flex items-start space-x-3 mb-6 pr-12">
          <div className="bg-muted text-foreground p-3 rounded-xl shrink-0">
            <FiTrendingUp className="text-2xl" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-extrabold text-card-foreground">Reseller Profit Calculator</h3>
            <p className="text-xs text-muted-foreground">Estimate your reseller margins per 50kg bale</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Bale Purchase Price (£)
            </label>
            <input
              type="tel"
              inputMode="decimal"
              value={balePrice}
              onChange={(e) => setBalePrice(Number(sanitizeDecimal(e.target.value)))}
              className="w-full bg-muted border border-border rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Estimated Items Count in Bale
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={estimatedPieces}
              onChange={(e) => setEstimatedPieces(Number(sanitizeDigits(e.target.value)))}
              className="w-full bg-muted border border-border rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Target Retail Sale Price Per Piece (£)
            </label>
            <input
              type="tel"
              inputMode="decimal"
              value={sellingPricePerPiece}
              onChange={(e) => setSellingPricePerPiece(Number(sanitizeDecimal(e.target.value)))}
              className="w-full bg-muted border border-border rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
            />
          </div>

          <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-xl border border-border">
              <span className="text-xs text-muted-foreground">Cost Per Piece</span>
              <div className="text-lg font-bold text-foreground">£{costPerPiece}</div>
            </div>
            <div className="bg-muted p-3 rounded-xl border border-border">
              <span className="text-xs text-muted-foreground">Total Projected Revenue</span>
              <div className="text-lg font-bold text-brand-red">£{totalRevenue}</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-700 font-medium">Estimated Net Profit</span>
                  <div className="text-2xl font-black text-emerald-700">£{netProfit}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-700">Profit Margin</span>
                  <div className="text-xl font-bold text-emerald-700 flex items-center justify-end">
                    <FiTrendingUp className="mr-1 text-sm" />
                    {marginPercent}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary mt-6 min-h-[48px]">
          Got It, Thanks!
        </button>
      </div>
    </div>
  );
}
