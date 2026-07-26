'use client';

import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { Category } from '@/lib/types';

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: Category[];
  preOrderOnly: boolean;
  onPreOrderToggle: () => void;
}

export default function ProductFilterBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  preOrderOnly,
  onPreOrderToggle,
}: Props) {
  return (
    <div className="bg-muted border border-border rounded-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
      <div className="relative w-full">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
        <input
          type="search"
          placeholder="Search bales (e.g. Women, Kids)..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[44px]"
        />
      </div>

      <div className="flex items-start gap-2">
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground pt-2 shrink-0">
          <FiFilter className="text-brand-red" />
          <span>Category:</span>
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          <button
            type="button"
            onClick={() => onCategoryChange('')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition min-h-[40px] ${
              selectedCategory === ''
                ? 'bg-primary text-primary-foreground'
                : 'bg-background border border-border text-foreground hover:bg-accent'
            }`}
          >
            All Bales
          </button>

          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition min-h-[40px] ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border text-foreground hover:bg-accent'
              }`}
            >
              {cat.name}
            </button>
          ))}

          <button
            type="button"
            onClick={onPreOrderToggle}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition min-h-[40px] ${
              preOrderOnly
                ? 'bg-brand-red text-white'
                : 'bg-background border border-border text-foreground hover:bg-accent'
            }`}
          >
            Pre-Orders Only
          </button>
        </div>
      </div>
    </div>
  );
}
