/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image_url: string;
}

interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string;
  status: "new" | "processing" | "shipping" | "completed" | "cancelled";
  items: OrderItem[];
  total: number;
  donation_amount: number;
  shipping_address: string;
  tracking_number: string | null;
  created_at: string;
  users: { display_name: string; email: string };
}

const statusLabel: Record<string, string> = {
  new: "New",
  processing: "Processing",
  shipping: "Shipping",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusColor: Record<string, string> = {
  new: "bg-blue-50 text-blue-600",
  processing: "bg-yellow-50 text-yellow-600",
  shipping: "bg-orange-50 text-orange-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const pendingOrders = orders.filter(
    (o) => o.status === "new" || o.status === "processing",
  ).length;
  const shippingOrders = orders.filter((o) => o.status === "shipping").length;
  const monthRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const monthDonationTotal = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.donation_amount || 0), 0);
  const monthDonationCount = orders.filter(
    (o) => (o.donation_amount || 0) > 0 && o.status !== "cancelled",
  ).length;

  const kpis = [
    { label: "Total Orders", value: String(total), icon: "📦" },
    { label: "Pending", value: String(pendingOrders), icon: "⏳" },
    { label: "Shipping", value: String(shippingOrders), icon: "🚚" },
    { label: "Revenue", value: `Y${monthRevenue.toLocaleString()}`, icon: "💰" },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-3xl font-bold text-[#0D1B2A]"
      >
        Order Management
      </motion.h1>

      {/* KPI Cards */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-sm text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Donation KPI Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="rounded-2xl border border-[#2A9D8F]/20 bg-gradient-to-r from-[#2A9D8F]/10 to-[#2A9D8F]/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <span className="text-sm font-medium text-[#2A9D8F]">Purchase Donations</span>
          </div>
          <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">
            Y{monthDonationTotal.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">5% of sales donated</p>
        </div>
        <div className="rounded-2xl border border-[#2A9D8F]/20 bg-gradient-to-r from-[#2A9D8F]/10 to-[#2A9D8F]/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <span className="text-sm font-medium text-[#2A9D8F]">Donation Orders</span>
          </div>
          <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">
            {monthDonationCount} orders
          </p>
          <p className="mt-1 text-xs text-gray-500">Excluding cancelled</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="processing">Processing</option>
              <option value="shipping">Shipping</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-600 transition-all duration-200 hover:bg-gray-200">
              CSV Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        {orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1B2A] text-white">
                  <th className="rounded-tl-lg px-2 py-3 text-left font-medium">Order #</th>
                  <th className="px-2 py-3 text-left font-medium">Date</th>
                  <th className="px-2 py-3 text-left font-medium">Customer</th>
                  <th className="px-2 py-3 text-right font-medium">Total</th>
                  <th className="px-2 py-3 text-right font-medium">Donation</th>
                  <th className="px-2 py-3 text-center font-medium">Status</th>
                  <th className="rounded-tr-lg px-2 py-3 text-center font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, orderIdx) => (
                  <tr
                    key={order.id}
                    className={`cursor-pointer border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 ${orderIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    onClick={() => {
                      setSelectedOrder(order);
                      setTrackingInput(order.tracking_number || "");
                      setAdminNotes("");
                    }}
                  >
                    <td className="px-2 py-3 font-mono text-xs text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-2 py-3 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-3 text-gray-700">
                      {order.users?.display_name || "Unknown"}
                    </td>
                    <td className="px-2 py-3 text-right font-medium text-gray-900">
                      Y{order.total.toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {(order.donation_amount || 0) > 0 ? (
                        <span className="font-medium text-[#2A9D8F]">
                          Y{order.donation_amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${statusColor[order.status] || ""}`}
                      >
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <select
                        defaultValue={order.status}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="processing">Processing</option>
                        <option value="shipping">Shipping</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Detail Slide Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-xl text-gray-400 hover:text-gray-700"
                  >
                    X
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-1 text-xs text-gray-400">Order Number</p>
                    <p className="font-mono text-sm font-bold text-gray-900">
                      {selectedOrder.order_number}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-1 text-xs text-gray-400">Status</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${statusColor[selectedOrder.status] || ""}`}
                    >
                      {statusLabel[selectedOrder.status] || selectedOrder.status}
                    </span>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-1 text-xs text-gray-400">Customer</p>
                    <p className="text-sm text-gray-700">
                      {selectedOrder.users?.display_name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">{selectedOrder.users?.email || ""}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-2 text-xs text-gray-400">Items</p>
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="mb-2 flex items-center gap-3">
                        {item.image_url && (
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            x{item.quantity} Y{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <p className="text-right text-sm font-bold text-gray-900">
                        Total: Y{selectedOrder.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Donation amount in detail */}
                  {(selectedOrder.donation_amount || 0) > 0 && (
                    <div className="rounded-xl border border-[#2A9D8F]/20 bg-[#2A9D8F]/5 p-4">
                      <p className="mb-1 text-xs text-[#2A9D8F]">Donation from this order</p>
                      <p className="text-lg font-bold text-[#2A9D8F]">
                        Y{selectedOrder.donation_amount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedOrder.shipping_address && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="mb-1 text-xs text-gray-400">Shipping Address</p>
                      <p className="text-sm text-gray-700">{selectedOrder.shipping_address}</p>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Enter tracking number..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Enter notes..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <button className="w-full rounded-xl bg-[#2A9D8F] py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90">
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
