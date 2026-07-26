'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth-service';
import { ProductService } from '@/services/product-service';
import { OrderService } from '@/services/order-service';
import { AdminService } from '@/services/admin-service';
import { ContactService, ContactMessage } from '@/services/contact-service';
import AdminAnalyticsDashboard from '@/components/features/admin/AdminAnalyticsDashboard';
import UserManagementTable from '@/components/features/admin/UserManagementTable';
import ProductFormModal from '@/components/features/admin/ProductFormModal';
import OrderListTable from '@/components/features/admin/OrderListTable';
import { Product, Order, User } from '@/lib/types';
import { FiTrendingUp, FiBox, FiShoppingBag, FiUsers, FiShield, FiShoppingCart, FiList, FiPlusCircle, FiEdit, FiTrash2, FiMail } from 'react-icons/fi';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'users' | 'carts' | 'messages' | 'audit'>('analytics');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [carts, setCarts] = useState<any[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const me = await AuthService.getMe();
      if (!me.user || (me.user.role !== 'ADMIN' && me.user.role !== 'SUPER_ADMIN' && me.user.role !== 'STAFF')) {
        router.push('/?error=forbidden');
        return;
      }
      setCurrentUser(me.user);

      const [pRes, cRes, oRes, uRes, cartRes, messagesRes, auditRes] = await Promise.all([
        ProductService.getProducts(),
        fetch('/api/categories').then((r) => r.json()),
        OrderService.getOrders(),
        AdminService.getUsers(),
        AdminService.getLiveCarts(),
        ContactService.getAll(),
        AdminService.getAuditLogs(),
      ]);

      setProducts(pRes.products || []);
      setCategories(cRes.categories || []);
      setOrders(oRes.orders || []);
      setUsers(uRes.users || []);
      setCarts(cartRes.carts || []);
      setMessages(messagesRes.messages || []);
      setAuditLogs(auditRes.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bale product?')) return;
    try {
      await ProductService.deleteProduct(id);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      await ContactService.markRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch (e: any) {
      alert(e.message || 'Failed to update message');
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-muted-foreground animate-pulse">Loading Admin Control Center...</div>;
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED' ? sum + o.totalAmount : sum), 0);
  const lowStockCount = products.filter((p) => p.stockCount <= 3).length;
  const unreadMessages = messages.filter((m) => !m.isRead).length;

  const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'analytics', label: 'Analytics', icon: <FiTrendingUp />, count: -1 },
    { key: 'products', label: 'Products', icon: <FiBox />, count: products.length },
    { key: 'orders', label: 'Orders', icon: <FiShoppingBag />, count: orders.length },
    { key: 'users', label: 'Users', icon: <FiUsers />, count: users.length },
    { key: 'carts', label: 'Carts', icon: <FiShoppingCart />, count: carts.length },
    { key: 'messages', label: 'Messages', icon: <FiMail />, count: messages.length },
    { key: 'audit', label: 'Audit', icon: <FiList />, count: auditLogs.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Top Header */}
      <div className="bg-card border border-border p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="min-w-0">
          <span className="text-xs font-bold text-brand-red uppercase tracking-wider">Enterprise Admin & Staff Portal</span>
          <h1 className="text-xl sm:text-3xl font-black text-card-foreground mt-1">Reseller Bus Control Center</h1>
        </div>
        <div className="flex items-center space-x-3 text-xs bg-muted px-4 py-2 rounded-xl border border-border text-muted-foreground min-w-0">
          <FiShield className="text-brand-red text-sm shrink-0" />
          <span className="truncate">Logged in as <strong className="text-foreground">{currentUser?.firstName} ({currentUser?.role})</strong></span>
        </div>
      </div>

      {/* Tabs Bar — horizontal scroll on mobile */}
      <div className="border-b border-border pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap min-h-[44px] ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.icon}
              <span>
                {tab.label}
                {tab.count >= 0 && ` (${tab.count})`}
              </span>
              {tab.key === 'messages' && unreadMessages > 0 && (
                <span className="bg-brand-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AdminAnalyticsDashboard
          stats={{
            totalRevenue,
            totalOrders: orders.length,
            totalUsers: users.length,
            totalProducts: products.length,
            lowStockCount,
          }}
        />
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-card-foreground">50kg Wholesale Clothing Bales Catalog</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
              className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow"
            >
              <FiPlusCircle />
              <span>Add New Bale Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted text-muted-foreground font-semibold uppercase text-[11px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (£)</th>
                  <th className="py-3 px-4">Est. Pieces</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Pre-Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/60 transition">
                    <td className="py-3.5 px-4 font-bold text-card-foreground">{p.title}</td>
                    <td className="py-3.5 px-4 text-brand-red">{p.category?.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">£{p.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4">{p.estimatedPieces}</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">{p.stockCount}</td>
                    <td className="py-3.5 px-4">
                      {p.isPreOrder ? (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          Pre-Order
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setShowProductModal(true);
                        }}
                        className="bg-muted hover:bg-border text-foreground p-2 rounded transition"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-2 rounded transition"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <OrderListTable
          orders={orders}
          users={users}
          products={products}
          onRefresh={fetchData}
        />
      )}

      {/* Users & Staff Tab */}
      {activeTab === 'users' && (
        <UserManagementTable
          users={users}
          onRefresh={fetchData}
          currentUserRole={currentUser?.role}
        />
      )}

      {/* Live User Carts Tab */}
      {activeTab === 'carts' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <FiShoppingCart className="text-brand-red" /> Active Live Reseller Carts
          </h3>
          <p className="text-xs text-muted-foreground">Inspect contents of active user carts in real time to assist phone orders</p>

          {carts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">No active user carts right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carts.map((cartUser) => (
                <div key={cartUser.id} className="bg-muted border border-border p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>{cartUser.firstName} {cartUser.lastName} ({cartUser.email})</span>
                    <span className="text-brand-red font-mono">{cartUser.mobileNumber}</span>
                  </div>
                  <div className="space-y-1 text-muted-foreground pt-1 border-t border-border">
                    {cartUser.cartItems?.map((ci: any) => (
                      <div key={ci.id} className="flex justify-between">
                        <span>{ci.quantity}x {ci.product?.title}</span>
                        <span className="font-mono text-foreground">£{(ci.product?.price * ci.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <FiMail className="text-brand-red" /> Contact Form Submissions
          </h3>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">No messages yet.</div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bg-muted border p-4 rounded-xl space-y-2 text-xs ${m.isRead ? 'border-border' : 'border-brand-red/40'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-foreground">{m.name}</span>{' '}
                      <span className="text-muted-foreground">({m.email} • {m.phone})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{new Date(m.createdAt).toLocaleString('en-GB')}</span>
                      {!m.isRead && (
                        <button
                          onClick={() => handleMarkMessageRead(m.id)}
                          className="bg-primary text-primary-foreground font-bold px-2.5 py-1 rounded-lg text-[11px]"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Destination:</span> {m.country}
                    {m.stockInterest && (
                      <>
                        {' • '}
                        <span className="font-semibold text-foreground">Interested in:</span> {m.stockInterest}
                      </>
                    )}
                  </div>
                  <p className="text-foreground">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <FiList className="text-brand-red" /> System Audit Trail
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted text-muted-foreground font-semibold uppercase text-[11px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/60 transition">
                    <td className="py-2.5 px-4 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('en-GB')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-brand-red">{log.action}</td>
                    <td className="py-2.5 px-4 text-foreground">
                      {log.user ? `${log.user.firstName} (${log.user.role})` : 'System'}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onRefresh={fetchData}
        categories={categories}
        editingProduct={editingProduct}
      />
    </div>
  );
}
