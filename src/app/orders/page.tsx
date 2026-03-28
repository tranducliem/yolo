"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockOrders } from "@/lib/mockData";
import AuthGate from "@/components/AuthGate";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import DonationBadge from "@/components/DonationBadge";

type TabKey = "all" | "shipping" | "completed" | "cancelled";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "shipping", label: "配送中" },
  { key: "completed", label: "完了" },
  { key: "cancelled", label: "キャンセル" },
];

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  new: { label: "新規", color: "text-blue-600", bg: "bg-blue-50" },
  processing: { label: "準備中", color: "text-yellow-600", bg: "bg-yellow-50" },
  shipping: { label: "配送中", color: "text-orange-600", bg: "bg-orange-50" },
  completed: { label: "完了", color: "text-green-600", bg: "bg-green-50" },
  cancelled: { label: "キャンセル", color: "text-red-600", bg: "bg-red-50" },
};

function OrdersContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = mockOrders.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "shipping")
      return o.status === "shipping" || o.status === "processing" || o.status === "new";
    if (activeTab === "completed") return o.status === "completed";
    if (activeTab === "cancelled") return o.status === "cancelled";
    return true;
  });

  const isEmpty = filteredOrders.length === 0;

  // Calculate total donation across all orders
  const totalDonation = mockOrders.reduce((sum, o) => sum + o.donationAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />
      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-2xl hover:opacity-70 transition-all duration-200">←</button>
          <h1 className="text-3xl font-bold text-[#0D1B2A] flex-1">📦 注文履歴</h1>
        </div>

        {/* Donation summary banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-6 border border-emerald-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <div>
                <p className="text-xs text-emerald-600 font-medium">お買い物からの寄付累計</p>
                <p className="text-lg font-bold text-emerald-700">¥{totalDonation.toLocaleString()}</p>
              </div>
            </div>
            <span className="text-xs text-emerald-500 bg-emerald-100 px-2 py-1 rounded-full font-medium">
              {mockOrders.filter((o) => o.donationAmount > 0).length}件の寄付
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-[#2A9D8F] text-white shadow-sm"
                  : "bg-white text-[#4B5563] border border-gray-200 hover:border-[#2A9D8F] hover:text-[#2A9D8F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="text-8xl mb-6">🐾</div>
              <p className="text-xl font-bold text-[#0D1B2A] mb-2">
                まだ注文がありません
              </p>
              <p className="text-[#9CA3AF] text-sm mb-8">
                お気に入りのグッズを見つけましょう
              </p>
              <Link
                href="/goods"
                className="bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg shadow-accent/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                グッズを見る
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredOrders.map((order, i) => {
                const status = statusConfig[order.status];
                const isExpanded = expandedOrder === order.id;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-mono text-sm font-bold text-[#0D1B2A]">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-[#9CA3AF]">{order.date}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${status.color} ${status.bg}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Item Thumbnails */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, j) => (
                            <div
                              key={j}
                              className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white bg-gray-100 flex-shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {order.items.map((item, j) => (
                            <p key={j} className="text-sm text-gray-600 truncate">
                              {item.name} x{item.quantity}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Total + Donation + Expand */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent">
                            ¥{order.total.toLocaleString()}
                          </span>
                          {order.donationAmount > 0 && (
                            <DonationBadge amount={order.donationAmount} />
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setExpandedOrder(isExpanded ? null : order.id)
                          }
                          className="text-sm text-[#2A9D8F] font-medium flex items-center gap-1 hover:opacity-80 transition-all duration-200"
                        >
                          詳細を見る
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="inline-block"
                          >
                            ▼
                          </motion.span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-gray-100 pt-3 space-y-3">
                            {/* Shipping address */}
                            <div>
                              <p className="text-xs text-gray-400 mb-1">お届け先</p>
                              <p className="text-sm">{order.shippingAddress}</p>
                            </div>

                            {/* Tracking */}
                            {order.trackingNumber && (
                              <div>
                                <p className="text-xs text-gray-400 mb-1">
                                  追跡番号
                                </p>
                                <p className="text-sm font-mono text-accent font-bold">
                                  {order.trackingNumber}
                                </p>
                              </div>
                            )}

                            {/* Shipping progress bar for active orders */}
                            {(order.status === "shipping" ||
                              order.status === "processing" ||
                              order.status === "new") && (
                              <div>
                                <p className="text-xs text-gray-400 mb-2">
                                  配送状況
                                </p>
                                <div className="flex items-center gap-1">
                                  {["注文確認", "準備中", "発送済", "配達完了"].map(
                                    (step, si) => {
                                      const progress =
                                        order.status === "new"
                                          ? 0
                                          : order.status === "processing"
                                          ? 1
                                          : order.status === "shipping"
                                          ? 2
                                          : 3;
                                      const active = si <= progress;
                                      return (
                                        <div key={step} className="flex-1">
                                          <div
                                            className={`h-1.5 rounded-full ${
                                              active ? "bg-accent" : "bg-gray-200"
                                            }`}
                                          />
                                          <p
                                            className={`text-[10px] mt-1 text-center ${
                                              active
                                                ? "text-accent font-bold"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            {step}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Item breakdown */}
                            <div>
                              <p className="text-xs text-gray-400 mb-2">商品詳細</p>
                              {order.items.map((item, j) => (
                                <div
                                  key={j}
                                  className="flex items-center gap-3 py-2"
                                >
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      ¥{item.price.toLocaleString()} x{item.quantity}
                                    </p>
                                  </div>
                                  <span className="text-sm font-bold">
                                    ¥{(item.price * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Donation detail in expanded view */}
                            {order.donationAmount > 0 && (
                              <div className="bg-emerald-50 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🌟</span>
                                  <div>
                                    <p className="text-sm font-bold text-emerald-700">
                                      ¥{order.donationAmount.toLocaleString()}寄付済み
                                    </p>
                                    <p className="text-[10px] text-emerald-500">
                                      NPO法人アニマルレスキュー福岡へ（購入額の5%）
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGate>
      <OrdersContent />
    </AuthGate>
  );
}
