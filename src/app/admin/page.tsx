"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { mockKPIData } from "@/lib/mockData";

const realtimeEvents = [
  "🐾 ユイ(東京)がベストショットをシェア",
  "👑 モカが今日のCrownに選出！",
  "⚔️ ラテ vs コタロウのBattleが開始",
  "🎯 「#おやつタイム」に新しい投稿",
  "💎 佐藤アヤさんがPROプランに加入",
  "📦 注文 YOLO-20260327-012 が発送完了",
  "🐶 新規登録: マルくん(ポメラニアン)",
  "❤️ ミケの写真が100いいね達成",
  "🎵 コタロウのSongが生成完了",
  "💌 レオからのLetterが届きました",
  "🌟 田中さくらさんが寄付タグで投稿",
  "🏆 福岡地域アンバサダーが更新されました",
];

const pmfMetrics = [
  { label: "DL", current: 24567, target: 30000, unit: "" },
  { label: "有料率", current: 18.5, target: 30, unit: "%" },
  { label: "DAU/MAU", current: 42, target: 40, unit: "%" },
  { label: "ARPU", current: 3280, target: 3500, unit: "¥" },
  { label: "NPS", current: 52, target: 50, unit: "" },
];

export default function AdminDashboard() {
  const [events, setEvents] = useState<string[]>([realtimeEvents[0]]);
  const [eventIndex, setEventIndex] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setEventIndex((prev) => {
        const next = (prev + 1) % realtimeEvents.length;
        setEvents((evts) => [realtimeEvents[next], ...evts].slice(0, 8));
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const kpiCards = [
    { icon: "📱", label: "MAU", value: "82,345", change: "+12.3%", sub: "人", href: "/admin/users" },
    { icon: "📅", label: "DAU", value: "34,567", change: "+8.7%", sub: "人", href: "/admin/analytics" },
    { icon: "💰", label: "MRR", value: "¥4,234,500", change: "+15.2%", sub: "", href: "/admin/subscription" },
    { icon: "💎", label: "課金率", value: "18.5%", change: "+2.1pt", sub: "", href: "/admin/subscription" },
  ];

  const donationKpis = [
    { icon: "🌟", label: "今月寄付額", value: "¥523,400", change: "+18.5%", href: "/admin/donation" },
    { icon: "🤝", label: "寄付者数", value: "12,847", change: "+9.3%", href: "/admin/donation" },
    { icon: "🏠", label: "寄付先施設数", value: "3", change: "", href: "/admin/donation" },
  ];

  const maxDau = Math.max(...mockKPIData.map((d) => d.dau));
  const maxMrr = Math.max(...mockKPIData.map((d) => d.mrr));
  const maxDonation = Math.max(...mockKPIData.map((d) => d.donationTotal));

  const pmfPassed = pmfMetrics.filter((m) => m.current >= m.target).length;

  return (
    <div className="p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#0D1B2A] mb-6"
      >
        KPI ダッシュボード
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi, i) => (
          <Link key={kpi.label} href={kpi.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{kpi.icon}</span>
                <span className="text-sm text-gray-500">{kpi.label}</span>
              </div>
              <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">
                {kpi.value}
                <span className="text-xs text-gray-400 ml-1">{kpi.sub}</span>
              </p>
              <span className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                </svg>
                {kpi.change}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Donation KPI Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {donationKpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div
              className="bg-gradient-to-r from-[#2A9D8F]/10 to-[#2A9D8F]/5 rounded-2xl p-5 border border-[#2A9D8F]/20 hover:shadow-md hover:-translate-y-0.5 hover:border-[#2A9D8F]/40 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{kpi.icon}</span>
                <span className="text-sm text-[#2A9D8F] font-medium">{kpi.label}</span>
              </div>
              <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">{kpi.value}</p>
              {kpi.change && (
                <span className="text-sm text-[#2A9D8F] flex items-center gap-1 mt-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                  </svg>
                  {kpi.change}
                </span>
              )}
            </div>
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Charts area */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DAU Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">DAU推移（30日間）</h3>
            <div className="flex items-end gap-[2px] h-40">
              {mockKPIData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-sm min-h-[2px] transition-all"
                    style={{
                      height: `${(d.dau / maxDau) * 100}%`,
                      backgroundColor: "#2A9D8F",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-400">{mockKPIData[0].date}</span>
              <span className="text-[10px] text-gray-400">{mockKPIData[mockKPIData.length - 1].date}</span>
            </div>
          </motion.div>

          {/* MRR Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">MRR推移（30日間）</h3>
            <div className="flex items-end gap-[2px] h-40">
              {mockKPIData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-sm min-h-[2px] transition-all"
                    style={{
                      height: `${(d.mrr / maxMrr) * 100}%`,
                      backgroundColor: "#D4A843",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-400">{mockKPIData[0].date}</span>
              <span className="text-[10px] text-gray-400">{mockKPIData[mockKPIData.length - 1].date}</span>
            </div>
          </motion.div>

          {/* Donation Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 md:col-span-2"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">🌟 寄付額推移（30日間）</h3>
            <div className="flex items-end gap-[2px] h-32">
              {mockKPIData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full rounded-t-sm min-h-[2px] transition-all"
                    style={{
                      height: `${(d.donationTotal / maxDonation) * 100}%`,
                      background: "linear-gradient(to top, #2A9D8F, #2A9D8F80)",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-400">{mockKPIData[0].date}</span>
              <span className="text-[10px] text-gray-400">{mockKPIData[mockKPIData.length - 1].date}</span>
            </div>
          </motion.div>
        </div>

        {/* Realtime feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">リアルタイムフィード</h3>
          <div className="space-y-2 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {events.map((ev, i) => (
                <motion.div
                  key={`${ev}-${i}`}
                  initial={{ opacity: 0, x: 30, height: 0 }}
                  animate={{ opacity: 1 - i * 0.1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-2.5"
                >
                  {ev}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* PMF Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-5">PMF判定パネル</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {pmfMetrics.map((m) => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));
            const passed = m.current >= m.target;
            const near = !passed && pct >= 80;
            return (
              <div key={m.label} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  <span className={`text-xs font-bold ${passed ? "text-emerald-600" : near ? "text-amber-500" : "text-[#E63946]"}`}>
                    {passed ? "達成" : `${pct}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className={`h-2 rounded-full ${passed ? "bg-emerald-500" : near ? "bg-amber-400" : "bg-[#E63946]"}`}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {m.unit === "¥" ? `¥${m.current.toLocaleString()}` : `${m.current.toLocaleString()}${m.unit}`}
                  {" / "}
                  {m.unit === "¥" ? `¥${m.target.toLocaleString()}` : `${m.target.toLocaleString()}${m.unit}`}
                </p>
              </div>
            );
          })}
        </div>
        <div
          className={`text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            pmfPassed >= 4 ? "bg-emerald-50 text-emerald-700" : pmfPassed >= 3 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-[#E63946]"
          }`}
        >
          Go/No-Go判定: {pmfPassed}/5達成 → {pmfPassed >= 4 ? "Go" : "要注意"}
        </div>
      </motion.div>
    </div>
  );
}
