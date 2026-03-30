"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockOrders } from "@/lib/mockData";
import AuthGate from "@/components/features/auth/AuthGate";
import DonationBadge from "@/components/features/donation/DonationBadge";

type TabKey = "all" | "shipping" | "completed" | "cancelled";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "shipping", label: "配送中" },
  { key: "completed", label: "完了" },
  { key: "cancelled", label: "キャンセル" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
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
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-2xl transition-all duration-200 hover:opacity-70"
          >
            ←
          </button>
          <h1 className="flex-1 text-3xl font-bold text-[#0D1B2A]">📦 注文履歴</h1>
        </div>

        {/* Donation summary banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <div>
                <p className="text-xs font-medium text-emerald-600">お買い物からの寄付累計</p>
                <p className="text-lg font-bold text-emerald-700">
                  ¥{totalDonation.toLocaleString()}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-500">
              {mockOrders.filter((o) => o.donationAmount > 0).length}件の寄付
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="hide-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-[#2A9D8F] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-[#4B5563] hover:border-[#2A9D8F] hover:text-[#2A9D8F]"
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
              <div className="mb-6 text-8xl">🐾</div>
              <p className="mb-2 text-xl font-bold text-[#0D1B2A]">まだ注文がありません</p>
              <p className="mb-8 text-sm text-[#9CA3AF]">お気に入りのグッズを見つけましょう</p>
              <Link
                href="/goods"
                className="shadow-accent/20 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-8 py-3 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
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
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Order Header */}
                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm font-bold text-[#0D1B2A]">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-[#9CA3AF]">{order.date}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.color} ${status.bg}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Item Thumbnails */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, j) => (
                            <div
                              key={j}
                              className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 border-white bg-gray-100"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-xs font-bold text-gray-500">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {order.items.map((item, j) => (
                            <p key={j} className="truncate text-sm text-gray-600">
                              {item.name} x{item.quantity}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Total + Donation + Expand */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-bold">
                            ¥{order.total.toLocaleString()}
                          </span>
                          {order.donationAmount > 0 && (
                            <DonationBadge amount={order.donationAmount} />
                          )}
                        </div>
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="flex items-center gap-1 text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:opacity-80"
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
                          <div className="space-y-3 border-t border-gray-100 px-5 pt-3 pb-5">
                            {/* Shipping address */}
                            <div>
                              <p className="mb-1 text-xs text-gray-400">お届け先</p>
                              <p className="text-sm">{order.shippingAddress}</p>
                            </div>

                            {/* Tracking */}
                            {order.trackingNumber && (
                              <div>
                                <p className="mb-1 text-xs text-gray-400">追跡番号</p>
                                <p className="text-accent font-mono text-sm font-bold">
                                  {order.trackingNumber}
                                </p>
                              </div>
                            )}

                            {/* Shipping progress bar for active orders */}
                            {(order.status === "shipping" ||
                              order.status === "processing" ||
                              order.status === "new") && (
                              <div>
                                <p className="mb-2 text-xs text-gray-400">配送状況</p>
                                <div className="flex items-center gap-1">
                                  {["注文確認", "準備中", "発送済", "配達完了"].map((step, si) => {
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
                                          className={`mt-1 text-center text-[10px] ${
                                            active ? "text-accent font-bold" : "text-gray-300"
                                          }`}
                                        >
                                          {step}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Item breakdown */}
                            <div>
                              <p className="mb-2 text-xs text-gray-400">商品詳細</p>
                              {order.items.map((item, j) => (
                                <div key={j} className="flex items-center gap-3 py-2">
                                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
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
                              <div className="rounded-xl bg-emerald-50 p-3">
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
    </>
  );
}

export default function OrdersPage() {
  return (
    <AuthGate>
      <OrdersContent />
    </AuthGate>
  );
}
