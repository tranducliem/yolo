"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase/client";
import { useToast } from "@/components/ui/Toast";

export default function PushNotificationSetup() {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || registered) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Check if already granted
    if (Notification.permission === "granted") {
      registerToken();
      return;
    }

    // Show prompt after 3 seconds if not denied
    if (Notification.permission !== "denied") {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, registered]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isLoggedIn) return;
    onForegroundMessage((payload) => {
      const p = payload as { notification?: { title?: string; body?: string } };
      if (p.notification?.title) {
        toast.show(`${p.notification.title}: ${p.notification.body ?? ""}`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  async function registerToken() {
    const token = await requestNotificationPermission();
    if (token) {
      await fetch("/api/notifications/register-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setRegistered(true);
    }
    setShowPrompt(false);
  }

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed right-4 bottom-20 left-4 z-50 mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-xl md:bottom-6"
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-sm font-bold text-gray-900">通知を受け取りますか？</p>
            <p className="mt-1 text-xs text-gray-500">
              いいね、フォロー、寄付レポートなどの通知をリアルタイムで受け取れます
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrompt(false)}
            className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            あとで
          </button>
          <button
            onClick={registerToken}
            className="flex-1 rounded-xl bg-[#2A9D8F] py-2 text-sm font-bold text-white transition-colors hover:bg-[#238b7e]"
          >
            許可する
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
