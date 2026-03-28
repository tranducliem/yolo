"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockNotifications } from "@/lib/mockData";
import type { MockNotification } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";
import AuthGate from "@/components/features/auth/AuthGate";

type TabId = "all" | "like" | "follow" | "system" | "donation";

const tabs: { id: TabId; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "like", label: "いいね" },
  { id: "follow", label: "フォロー" },
  { id: "system", label: "システム" },
  { id: "donation", label: "🌟寄付" },
];

function filterByTab(n: MockNotification, tab: TabId): boolean {
  if (tab === "all") return true;
  if (tab === "like") return n.type === "like";
  if (tab === "follow") return n.type === "follow";
  if (tab === "donation") return n.type === "donation";
  // system tab includes system, order, crown, battle, dare, letter, song
  return !["like", "follow", "donation"].includes(n.type);
}

function NotificationsContent() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  const filtered = notifications.filter((n) => filterByTab(n, activeTab));
  const unreadCount = notifications.filter((n) => !n.read).length;
  const donationUnread = notifications.filter((n) => n.type === "donation" && !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleTap = (n: MockNotification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );
    router.push(n.link);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isLoggedIn ? "pb-24 md:pb-8 lg:pl-60" : "pb-20"}`}>
      <SideNav />

      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-[#4B5563] hover:text-[#0D1B2A] transition-all duration-200 text-lg"
            >
              &larr; 戻る
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-[#2A9D8F] font-medium hover:underline transition-all duration-200"
            >
              すべて既読にする
            </button>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-bold text-[#0D1B2A] mb-4"
        >
          🔔 通知
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-medium text-white bg-red-500 rounded-full px-2 py-0.5 align-middle">
              {unreadCount}
            </span>
          )}
        </motion.h1>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? tab.id === "donation"
                    ? "bg-emerald-500 text-white"
                    : "bg-[#2A9D8F] text-white"
                  : tab.id === "donation"
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.id === "donation" && donationUnread > 0 && activeTab !== "donation" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {donationUnread}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Notification list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => {
              const isDonation = n.type === "donation";
              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTap(n)}
                  className={`w-full text-left rounded-2xl p-5 flex items-start gap-3 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                    isDonation
                      ? n.read
                        ? "bg-emerald-50/60 border-l-4 border-emerald-400"
                        : "bg-emerald-50 border-l-4 border-emerald-500"
                      : n.read
                      ? "bg-white"
                      : "bg-teal-50 border-l-4 border-[#2A9D8F]"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-relaxed ${
                        n.read
                          ? isDonation
                            ? "text-emerald-700"
                            : "text-gray-600"
                          : isDonation
                          ? "text-emerald-800 font-medium"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {n.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-[#9CA3AF]">{n.time}</p>
                      {isDonation && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
                          寄付
                        </span>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 animate-pulse ${
                      isDonation ? "bg-emerald-500" : "bg-[#2A9D8F]"
                    }`} />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-gray-400"
            >
              <p className="text-4xl mb-3">
                {activeTab === "donation" ? "🌟" : "🔔"}
              </p>
              <p className="text-sm">
                {activeTab === "donation"
                  ? "寄付に関する通知はありません"
                  : "通知はありません"}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
  );
}
