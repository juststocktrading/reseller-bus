'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth-service';
import { OrderService } from '@/services/order-service';
import { Order } from '@/lib/types';
import ExportInvoiceModal from '@/components/ExportInvoiceModal';
import { FiUser, FiPackage, FiKey, FiLogOut, FiFileText, FiTruck, FiShield } from 'react-icons/fi';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    AuthService.getMe()
      .then((res) => {
        if (!res.user) {
          router.push('/auth/login');
          return;
        }
        setUser(res.user);
        return OrderService.getOrders();
      })
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/');
    router.refresh();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    setLoadingPass(true);

    try {
      await AuthService.resetPassword(newPassword);
      setPassMsg('Password updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      setPassMsg(err.message || 'Failed to update password');
    } finally {
      setLoadingPass(false);
    }
  };

  if (!user) {
    return <div className="text-center py-24 text-muted-foreground animate-pulse">Loading reseller portal...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Portal Header */}
      <div className="bg-card border border-border p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="bg-muted text-foreground p-3 sm:p-4 rounded-2xl shrink-0">
            <FiUser className="text-2xl sm:text-3xl" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-card-foreground truncate">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-xs text-muted-foreground break-all">
              {user.email} • {user.role} Trade Account
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
            <Link
              href="/admin"
              className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs px-4 py-2.5 rounded-xl shadow transition text-center min-h-[44px] flex items-center justify-center"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-muted hover:bg-rose-50 text-muted-foreground hover:text-rose-700 border border-border px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px]"
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Orders Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-bold text-card-foreground text-base flex items-center gap-2 border-b border-border pb-3">
              <FiPackage className="text-brand-red shrink-0" /> Your Wholesale Orders ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                You haven't placed any wholesale bale orders yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-muted border border-border p-4 rounded-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                      <div>
                        <span className="font-mono font-bold text-brand-red text-sm">{order.orderNumber}</span>
                        <span className="text-muted-foreground ml-2">({new Date(order.createdAt).toLocaleDateString('en-GB')})</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.quantity}x {item.product?.title}</span>
                          <span className="font-mono">£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Logistics Tracking Info */}
                    <div className="bg-card p-3 rounded-lg border border-border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">Carrier & Tracking:</span>{' '}
                        {order.trackingNumber ? (
                          <span className="font-mono text-brand-red font-bold">{order.carrierName || 'Freight'}: {order.trackingNumber}</span>
                        ) : (
                          <span className="italic text-muted-foreground">Preparing for dispatch</span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <FiFileText /> Export Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security & Password Reset */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-xl text-xs">
            <h3 className="font-bold text-card-foreground text-sm flex items-center gap-2 border-b border-border pb-3">
              <FiKey className="text-brand-red" /> Account Security & Password
            </h3>

            {passMsg && (
              <div className="bg-muted border border-border text-foreground p-2.5 rounded-xl font-semibold">
                {passMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-foreground font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <button type="submit" disabled={loadingPass} className="btn-primary">
                {loadingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ExportInvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
}
