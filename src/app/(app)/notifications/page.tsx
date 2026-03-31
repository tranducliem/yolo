"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGate from "@/components/features/auth/AuthGate";

type TabId = "all" | "like" | "follow" | "system" | "donation";

const tabs: { id: TabId; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "like", label: "いいね" },
  { id: "follow", label: "フォロー" },
  { id: "system", label: "システム" },
  { id: "donation", label: "🌟寄付" },
];

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

function filterByTab(n: Notification, tab: TabId): boolean {
  if (tab === "all") return true;
  if (tab === "like") return n.type === "like";
  if (tab === "follow") return n.type === "follow";
  if (tab === "donation") return n.type === "donation";
  return !["like", "follow", "donation"].includes(n.type);
}

const typeIcons: Record<string, string> = {
  like: "❤️",
  follow: "👥",
  donation: "🌟",
  crown: "👑",
  battle: "⚔️",
  dare: "🎯",
  order: "📦",
  system: "🔔",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

function NotificationsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => filterByTab(n, activeTab));
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const donationUnread = notifications.filter((n) => n.type === "donation" && !n.isRead).length;

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleTap = async (n: Notification) => {
    if (!n.isRead) {
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
    }
    if (n.link) router.push(n.link);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        <div className="mb-4 h-10 animate-pulse rounded bg-gray-100" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-3 h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <button
          onClick={() => router.back()}
          className="text-lg text-[#4B5563] hover:text-[#0D1B2A]"
        >
          &larr; 戻る
        </button>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-[#2A9D8F] hover:underline"
          >
            すべて既読にする
          </button>
        )}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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
      <div className="hide-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? tab.id === "donation"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#2A9D8F] text-white"
                : tab.id === "donation"
                  ? "bg-emerald-50 text-emerald-700"
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
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((n, i) => {
            const isDonation = n.type === "donation";
            const icon = typeIcons[n.type] || "🔔";
            return (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTap(n)}
                className={`flex w-full items-start gap-3 rounded-2xl p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isDonation
                    ? n.isRead
                      ? "border-l-4 border-emerald-400 bg-emerald-50/60"
                      : "border-l-4 border-emerald-500 bg-emerald-50"
                    : n.isRead
                      ? "bg-white"
                      : "border-l-4 border-[#2A9D8F] bg-teal-50"
                }`}
              >
                <span className="mt-0.5 flex-shrink-0 text-2xl">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-relaxed ${
                      n.isRead
                        ? isDonation
                          ? "text-emerald-700"
                          : "text-gray-600"
                        : isDonation
                          ? "font-medium text-emerald-800"
                          : "font-medium text-gray-900"
                    }`}
                  >
                    {n.message || n.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm text-[#9CA3AF]">{timeAgo(n.createdAt)}</p>
                    {isDonation && (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                        寄付
                      </span>
                    )}
                  </div>
                </div>
                {!n.isRead && (
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full ${isDonation ? "bg-emerald-500" : "bg-[#2A9D8F]"}`}
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-3 text-4xl">{activeTab === "donation" ? "🌟" : "🔔"}</p>
            <p className="text-sm">
              {activeTab === "donation" ? "寄付に関する通知はありません" : "通知はありません"}
            </p>
          </div>
        )}
      </div>
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
