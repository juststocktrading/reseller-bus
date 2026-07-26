'use client';

import React, { useState } from 'react';
import { Order, User, Product } from '@/lib/types';
import { OrderService } from '@/services/order-service';
import { sanitizeDigits } from '@/lib/input-utils';
import ExportInvoiceModal from '@/components/ExportInvoiceModal';
import { FiPackage, FiTruck, FiFileText, FiPlusCircle, FiCheck, FiX } from 'react-icons/fi';

interface Props {
  orders: Order[];
  users: User[];
  products: Product[];
  onRefresh: () => void;
}

export default function OrderListTable({ orders, users, products, onRefresh }: Props) {
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [carrierName, setCarrierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState<any>('PENDING');

  // Order on Behalf of User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<'DELIVERY' | 'PICKUP_BRADFORD'>('DELIVERY');
  const [shippingCountry, setShippingCountry] = useState('UK');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setStatus(order.status);
    setCarrierName(order.carrierName || '');
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await OrderService.updateOrder(editingOrder.id, {
        status,
        carrierName,
        trackingNumber,
      });
      setEditingOrder(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    }
  };

  const handleCreateOnBehalf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedProductId) {
      alert('Please select a user and a product');
      return;
    }

    setLoading(true);
    try {
      await OrderService.createOrder({
        userId: selectedUserId,
        items: [{ productId: selectedProductId, quantity }],
        shippingMethod,
        shippingCountry,
        shippingAddress: shippingAddress || 'Standard Warehouse Dispatch / Pickup',
        paymentMethod: 'ADMIN_MANUAL',
      });

      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create order on behalf of user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <FiPackage className="text-brand-red" /> Orders & Shipping Management
          </h3>
          <p className="text-xs text-muted-foreground">Process orders, attach tracking details, and print customs invoices</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow transition"
        >
          <FiPlusCircle />
          <span>Create Order on Behalf of User</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-muted-foreground">
          <thead className="bg-muted text-muted-foreground font-semibold uppercase text-[11px] border-b border-border">
            <tr>
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Country & Method</th>
              <th className="py-3 px-4">Total (£)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Carrier & Tracking</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/60 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-brand-red">{order.orderNumber}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-card-foreground">{order.user?.firstName} {order.user?.lastName}</div>
                  <div className="text-[11px] text-muted-foreground">{order.user?.email}</div>
                  {order.createdByName && (
                    <div className="text-[10px] text-brand-red/90 italic">By: {order.createdByName}</div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-foreground">{order.shippingCountry}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {order.shippingMethod === 'PICKUP_BRADFORD' ? '🏬 Bradford Pickup' : '🚚 Delivery'}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                  £{order.totalAmount.toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${
                      order.status === 'PAID' || order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : order.status === 'SHIPPED'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[11px]">
                  {order.trackingNumber ? (
                    <div>
                      <div className="font-bold text-foreground">{order.carrierName || 'Freight'}</div>
                      <div className="font-mono text-brand-red">{order.trackingNumber}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">No Tracking</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleEditClick(order)}
                    className="bg-muted hover:bg-border text-foreground px-2.5 py-1 rounded text-[11px] font-semibold transition"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-2.5 py-1 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                    title="View Customs Export Commercial Invoice"
                  >
                    <FiFileText /> Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Order Tracking Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h4 className="font-bold text-card-foreground text-base mb-4">Update Order #{editingOrder.orderNumber}</h4>
            <form onSubmit={handleUpdateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Fulfillment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Carrier Name (e.g. DHL, Royal Mail, Freight Cargo)</label>
                <input
                  type="text"
                  placeholder="DHL / DPD / Freight"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Tracking Number</label>
                <input
                  type="text"
                  placeholder="Tracking code"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="bg-muted text-muted-foreground px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order on Behalf of User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-lg w-full shadow-2xl">
            <h4 className="font-bold text-card-foreground text-base mb-4">Create Order on Behalf of User (Phone/WhatsApp Sale)</h4>
            <form onSubmit={handleCreateOnBehalf} className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Select Reseller Customer</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email} - {u.mobileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Select 50kg Bale Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="">-- Choose Bale Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (£{p.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Bale Quantity</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(sanitizeDigits(e.target.value)) || 1))}
                    className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Shipping Country</label>
                  <select
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  >
                    <option value="UK">United Kingdom (£20)</option>
                    <option value="Ghana">Ghana (£50/bale)</option>
                    <option value="Nigeria">Nigeria (£60/bale)</option>
                    <option value="Gambia">Gambia (£80/bale)</option>
                    <option value="Europe">Europe (Pro-rata)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Fulfillment Mode</label>
                <select
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value as any)}
                  className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="DELIVERY">Delivery Freight Cargo</option>
                  <option value="PICKUP_BRADFORD">Self-Pickup at Bradford Warehouse (Free)</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Shipping Address / Pickup Notes</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Destination address details..."
                  className="w-full bg-muted border border-border p-2.5 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-muted text-muted-foreground px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground font-bold px-5 py-2 rounded shadow"
                >
                  {loading ? 'Creating...' : 'Place Manual Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Invoice Modal */}
      <ExportInvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
}
