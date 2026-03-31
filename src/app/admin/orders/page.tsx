"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockOrders } from "@/lib/mockData";
import type { MockOrder } from "@/types";

const statusLabel: Record<MockOrder["status"], string> = {
  new: "新規",
  processing: "処理中",
  shipping: "配送中",
  completed: "完了",
  cancelled: "キャンセル",
};

const statusColor: Record<MockOrder["status"], string> = {
  new: "bg-blue-50 text-blue-600",
  processing: "bg-yellow-50 text-yellow-600",
  shipping: "bg-orange-50 text-orange-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrdersAdminPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const filtered = mockOrders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (filterCategory !== "all") {
      const catMatch = o.items.some((it) => {
        if (filterCategory === "2d")
          return ["アクリルスタンド", "マグカップ", "Tシャツ", "スマホケース", "クッション", "フォトパネル"].includes(
            it.name
          );
        if (filterCategory === "3d") return it.name.includes("フィギュア");
        if (filterCategory === "book") return it.name.includes("フォトブック");
        return true;
      });
      if (!catMatch) return false;
    }
    return true;
  });

  const todayOrders = mockOrders.filter((o) => o.date === "2026-03-27").length || 12;
  const pendingOrders = mockOrders.filter((o) => o.status === "new" || o.status === "processing").length;
  const shippingOrders = mockOrders.filter((o) => o.status === "shipping").length;

  // Donation KPIs from orders
  const monthDonationTotal = mockOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.donationAmount, 0);
  const monthDonationCount = mockOrders.filter((o) => o.donationAmount > 0 && o.status !== "cancelled").length;

  const kpis = [
    { label: "今日の注文", value: String(todayOrders), icon: "📦" },
    { label: "処理待ち", value: String(pendingOrders), icon: "⏳" },
    { label: "配送中", value: String(shippingOrders), icon: "🚚" },
    { label: "今月売上", value: "¥1,234,500", icon: "💰" },
  ];

  return (
    <div className="p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#0D1B2A] mb-6"
      >
        注文管理
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-sm text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Donation KPI Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        <div className="bg-gradient-to-r from-[#2A9D8F]/10 to-[#2A9D8F]/5 rounded-2xl p-5 border border-[#2A9D8F]/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌟</span>
            <span className="text-sm text-[#2A9D8F] font-medium">今月の購入寄付額</span>
          </div>
          <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">¥{monthDonationTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">売上の5%が寄付に充当</p>
        </div>
        <div className="bg-gradient-to-r from-[#2A9D8F]/10 to-[#2A9D8F]/5 rounded-2xl p-5 border border-[#2A9D8F]/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤝</span>
            <span className="text-sm text-[#2A9D8F] font-medium">寄付対象件数</span>
          </div>
          <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">{monthDonationCount}件</p>
          <p className="text-xs text-gray-500 mt-1">キャンセル分を除く</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
      >
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">ステータス</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
            >
              <option value="all">すべて</option>
              <option value="new">新規</option>
              <option value="processing">処理中</option>
              <option value="shipping">配送中</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
            >
              <option value="all">すべて</option>
              <option value="2d">2Dグッズ</option>
              <option value="3d">3Dフィギュア</option>
              <option value="book">フォトブック</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">期間</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
              <span className="self-center text-gray-400">〜</span>
              <input
                type="date"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200">
              CSVエクスポート
            </button>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D1B2A] text-white">
                <th className="text-left py-3 px-2 font-medium rounded-tl-lg">注文番号</th>
                <th className="text-left py-3 px-2 font-medium">日付</th>
                <th className="text-left py-3 px-2 font-medium">商品</th>
                <th className="text-right py-3 px-2 font-medium">数量</th>
                <th className="text-right py-3 px-2 font-medium">金額</th>
                <th className="text-right py-3 px-2 font-medium">寄付額</th>
                <th className="text-center py-3 px-2 font-medium">ステータス</th>
                <th className="text-center py-3 px-2 font-medium rounded-tr-lg">変更</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, orderIdx) => (
                <tr
                  key={order.id}
                  className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer ${orderIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => {
                    setSelectedOrder(order);
                    setTrackingInput(order.trackingNumber || "");
                    setAdminNotes("");
                  }}
                >
                  <td className="py-3 px-2 font-mono text-gray-900 text-xs">{order.orderNumber}</td>
                  <td className="py-3 px-2 text-gray-600">{order.date}</td>
                  <td className="py-3 px-2 text-gray-700">{order.items.map((it) => it.name).join(", ")}</td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {order.items.reduce((s, it) => s + it.quantity, 0)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-900 font-medium">
                    ¥{order.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {order.donationAmount > 0 ? (
                      <span className="text-[#2A9D8F] font-medium">¥{order.donationAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      defaultValue={order.status}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                    >
                      <option value="new">新規</option>
                      <option value="processing">処理中</option>
                      <option value="shipping">配送中</option>
                      <option value="completed">完了</option>
                      <option value="cancelled">キャンセル</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              className="relative w-full max-w-md bg-white h-full shadow-xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">注文詳細</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">注文番号</p>
                    <p className="text-sm font-mono font-bold text-gray-900">{selectedOrder.orderNumber}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">ステータス</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[selectedOrder.status]}`}>
                      {statusLabel[selectedOrder.status]}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-2">商品</p>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            x{item.quantity} ¥{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <p className="text-sm font-bold text-gray-900 text-right">
                        合計: ¥{selectedOrder.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Donation amount in detail */}
                  {selectedOrder.donationAmount > 0 && (
                    <div className="bg-[#2A9D8F]/5 rounded-xl p-4 border border-[#2A9D8F]/20">
                      <p className="text-xs text-[#2A9D8F] mb-1">🌟 この注文からの寄付額</p>
                      <p className="text-lg font-bold text-[#2A9D8F]">
                        ¥{selectedOrder.donationAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">売上の5%が保護団体へ寄付されます</p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">配送先</p>
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">追跡番号</label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="追跡番号を入力..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">管理者メモ</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="メモを入力..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-none"
                    />
                  </div>

                  <button className="w-full bg-[#2A9D8F] text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200">
                    更新を保存
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
