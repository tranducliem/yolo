"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { mockNotifications } from "@/lib/mockData";
import type { MockNotification } from "@/types";
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
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)),
    );
    router.push(n.link);
  };

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-lg text-[#4B5563] transition-all duration-200 hover:text-[#0D1B2A]"
            >
              &larr; 戻る
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:underline"
            >
              すべて既読にする
            </button>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 text-3xl font-bold text-[#0D1B2A]"
        >
          🔔 通知
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 align-middle text-sm font-medium text-white">
              {unreadCount}
            </span>
          )}
        </motion.h1>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="hide-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200 ${
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
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
                  className={`flex w-full items-start gap-3 rounded-2xl p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDonation
                      ? n.read
                        ? "border-l-4 border-emerald-400 bg-emerald-50/60"
                        : "border-l-4 border-emerald-500 bg-emerald-50"
                      : n.read
                        ? "bg-white"
                        : "border-l-4 border-[#2A9D8F] bg-teal-50"
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0 text-2xl">{n.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm leading-relaxed ${
                        n.read
                          ? isDonation
                            ? "text-emerald-700"
                            : "text-gray-600"
                          : isDonation
                            ? "font-medium text-emerald-800"
                            : "font-medium text-gray-900"
                      }`}
                    >
                      {n.text}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-[#9CA3AF]">{n.time}</p>
                      {isDonation && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                          寄付
                        </span>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full ${
                        isDonation ? "bg-emerald-500" : "bg-[#2A9D8F]"
                      }`}
                    />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-gray-400"
            >
              <p className="mb-3 text-4xl">{activeTab === "donation" ? "🌟" : "🔔"}</p>
              <p className="text-sm">
                {activeTab === "donation" ? "寄付に関する通知はありません" : "通知はありません"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
  );
}
