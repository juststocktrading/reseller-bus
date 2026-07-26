'use client';

import React from 'react';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiBox, FiAlertTriangle, FiGlobe } from 'react-icons/fi';

interface Props {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    lowStockCount: number;
  };
}

export default function AdminAnalyticsDashboard({ stats }: Props) {
  return (
    <div className="space-y-6 mb-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <FiTrendingUp className="text-2xl" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Total Revenue</span>
            <div className="text-xl font-bold text-emerald-600">£{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-rose-50 text-brand-red p-3 rounded-xl">
            <FiShoppingBag className="text-2xl" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Total Orders</span>
            <div className="text-xl font-bold text-card-foreground">{stats.totalOrders}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <FiUsers className="text-2xl" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Registered Resellers</span>
            <div className="text-xl font-bold text-card-foreground">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
            <FiBox className="text-2xl" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Bale Products</span>
            <div className="text-xl font-bold text-card-foreground">{stats.totalProducts}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
            <FiAlertTriangle className="text-2xl" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Low Stock Bales</span>
            <div className="text-xl font-bold text-rose-600">{stats.lowStockCount}</div>
          </div>
        </div>
      </div>

      {/* Destination Shipping Summary Banner */}
      <div className="bg-primary text-primary-foreground p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2.5 rounded-xl font-bold">
            <FiGlobe className="text-xl" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Global Freight & Export Hub Active</h4>
            <p className="text-xs text-white/60">Automated customs invoice generation enabled for Ghana, Nigeria, Gambia & Europe.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold bg-white/10 px-4 py-2 rounded-xl border border-white/10">
          <span>Standard Freight Rates Applied</span>
        </div>
      </div>
    </div>
  );
}
