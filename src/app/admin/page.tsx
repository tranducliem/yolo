"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  paidRate: number;
  totalPosts: number;
  totalOrders: number;
  totalDonation: number;
  totalRevenue: number;
}

// Placeholder events — will be replaced with real activity feed when data grows
const realtimeEvents = ["System ready", "Waiting for user activity..."];

const pmfMetrics = [
  { label: "DL", current: 0, target: 30000, unit: "" },
  { label: "Paid Rate", current: 0, target: 30, unit: "%" },
  { label: "DAU/MAU", current: 0, target: 40, unit: "%" },
  { label: "ARPU", current: 0, target: 3500, unit: "Y" },
  { label: "NPS", current: 0, target: 50, unit: "" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<string[]>([realtimeEvents[0]]);
  const [, setEventIndex] = useState(1);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    {
      icon: "👥",
      label: "Total Users",
      value: stats ? stats.totalUsers.toLocaleString() : "0",
      sub: "",
      href: "/admin/users",
    },
    {
      icon: "💎",
      label: "Paid Users",
      value: stats ? stats.paidUsers.toLocaleString() : "0",
      sub: "",
      href: "/admin/subscription",
    },
    {
      icon: "📝",
      label: "Total Posts",
      value: stats ? stats.totalPosts.toLocaleString() : "0",
      sub: "",
      href: "/admin/content",
    },
    {
      icon: "📦",
      label: "Total Orders",
      value: stats ? stats.totalOrders.toLocaleString() : "0",
      sub: "",
      href: "/admin/orders",
    },
  ];

  const donationKpis = [
    {
      icon: "🌟",
      label: "Total Donations",
      value: stats ? `Y${stats.totalDonation.toLocaleString()}` : "Y0",
      href: "/admin/donation",
    },
    {
      icon: "💰",
      label: "Total Revenue",
      value: stats ? `Y${stats.totalRevenue.toLocaleString()}` : "Y0",
      href: "/admin/orders",
    },
    {
      icon: "📊",
      label: "Paid Rate",
      value: stats ? `${stats.paidRate}%` : "0%",
      href: "/admin/subscription",
    },
  ];

  const computedPmf = pmfMetrics.map((m) => {
    if (!stats) return m;
    if (m.label === "DL") return { ...m, current: stats.totalUsers };
    if (m.label === "Paid Rate") return { ...m, current: stats.paidRate };
    return m;
  });

  const pmfPassed = computedPmf.filter((m) => m.current >= m.target).length;

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
          <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
        </div>
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
        KPI Dashboard
      </motion.h1>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi, i) => (
          <Link key={kpi.label} href={kpi.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{kpi.icon}</span>
                <span className="text-sm text-gray-500">{kpi.label}</span>
              </div>
              <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">
                {kpi.value}
                <span className="ml-1 text-xs text-gray-400">{kpi.sub}</span>
              </p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Donation KPI Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        {donationKpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div className="cursor-pointer rounded-2xl border border-[#2A9D8F]/20 bg-gradient-to-r from-[#2A9D8F]/10 to-[#2A9D8F]/5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2A9D8F]/40 hover:shadow-md">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{kpi.icon}</span>
                <span className="text-sm font-medium text-[#2A9D8F]">{kpi.label}</span>
              </div>
              <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">{kpi.value}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Empty charts area - no mock data */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-2">
          {/* DAU Chart placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold text-gray-700">DAU Trend (30 days)</h3>
            <div className="flex h-40 items-center justify-center text-sm text-gray-300">
              No data yet
            </div>
          </motion.div>

          {/* MRR Chart placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold text-gray-700">MRR Trend (30 days)</h3>
            <div className="flex h-40 items-center justify-center text-sm text-gray-300">
              No data yet
            </div>
          </motion.div>

          {/* Donation Chart placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-2"
          >
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Donation Trend (30 days)</h3>
            <div className="flex h-32 items-center justify-center text-sm text-gray-300">
              No data yet
            </div>
          </motion.div>
        </div>

        {/* Realtime feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Realtime Feed</h3>
          <div className="space-y-2 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {events.map((ev, i) => (
                <motion.div
                  key={`${ev}-${i}`}
                  initial={{ opacity: 0, x: 30, height: 0 }}
                  animate={{ opacity: 1 - i * 0.1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
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
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-5 text-sm font-semibold text-gray-700">PMF Panel</h3>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {computedPmf.map((m) => {
            const pct = Math.min(100, m.target > 0 ? Math.round((m.current / m.target) * 100) : 0);
            const passed = m.current >= m.target;
            const near = !passed && pct >= 80;
            return (
              <div key={m.label} className="rounded-xl bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  <span
                    className={`text-xs font-bold ${passed ? "text-emerald-600" : near ? "text-amber-500" : "text-[#E63946]"}`}
                  >
                    {passed ? "Achieved" : `${pct}%`}
                  </span>
                </div>
                <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className={`h-2 rounded-full ${passed ? "bg-emerald-500" : near ? "bg-amber-400" : "bg-[#E63946]"}`}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {m.unit === "Y"
                    ? `Y${m.current.toLocaleString()}`
                    : `${m.current.toLocaleString()}${m.unit}`}
                  {" / "}
                  {m.unit === "Y"
                    ? `Y${m.target.toLocaleString()}`
                    : `${m.target.toLocaleString()}${m.unit}`}
                </p>
              </div>
            );
          })}
        </div>
        <div
          className={`rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
            pmfPassed >= 4
              ? "bg-emerald-50 text-emerald-700"
              : pmfPassed >= 3
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-[#E63946]"
          }`}
        >
          Go/No-Go: {pmfPassed}/5 achieved {pmfPassed >= 4 ? "-> Go" : "-> Needs Attention"}
        </div>
      </motion.div>
    </div>
  );
}
