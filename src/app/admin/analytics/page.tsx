"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface AnalyticsData {
  signups: { created_at: string }[];
  orders: { created_at: string; total: number }[];
  donations: { created_at: string; amount: number }[];
  period: number;
}

export default function AnalyticsAdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics?days=30");
      if (!res.ok) return;
      const result = await res.json();
      setData(result);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalSignups = data?.signups?.length || 0;
  const totalOrders = data?.orders?.length || 0;
  const totalOrderRevenue = data?.orders?.reduce((s, o) => s + (o.total || 0), 0) || 0;
  const totalDonationAmount = data?.donations?.reduce((s, d) => s + (d.amount || 0), 0) || 0;

  // Build daily aggregation
  const dailyMap = new Map<string, { signups: number; orders: number; donations: number }>();
  data?.signups?.forEach((s) => {
    const day = s.created_at.slice(0, 10);
    const entry = dailyMap.get(day) || { signups: 0, orders: 0, donations: 0 };
    entry.signups++;
    dailyMap.set(day, entry);
  });
  data?.orders?.forEach((o) => {
    const day = o.created_at.slice(0, 10);
    const entry = dailyMap.get(day) || { signups: 0, orders: 0, donations: 0 };
    entry.orders++;
    dailyMap.set(day, entry);
  });
  data?.donations?.forEach((d) => {
    const day = d.created_at.slice(0, 10);
    const entry = dailyMap.get(day) || { signups: 0, orders: 0, donations: 0 };
    entry.donations += d.amount || 0;
    dailyMap.set(day, entry);
  });

  const dailyEntries = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));

  const maxSignups = Math.max(1, ...dailyEntries.map((d) => d.signups));
  const maxDonations = Math.max(1, ...dailyEntries.map((d) => d.donations));

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-8 h-48 animate-pulse rounded-2xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#0D1B2A]">Analytics</h1>

      {/* KPI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500">New Signups (30d)</p>
            <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">{totalSignups}</p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500">Orders (30d)</p>
            <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">{totalOrders}</p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500">Revenue (30d)</p>
            <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">
              Y{totalOrderRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500">Donations (30d)</p>
            <p className="text-3xl font-bold text-[#2A9D8F] tabular-nums">
              Y{totalDonationAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Signups Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Daily Signups</h3>
          {dailyEntries.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-300">
              No data yet
            </div>
          ) : (
            <div className="flex h-40 items-end gap-[2px]">
              {dailyEntries.map((d) => (
                <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className="min-h-[2px] w-full rounded-t-sm transition-all"
                    style={{
                      height: `${(d.signups / maxSignups) * 100}%`,
                      backgroundColor: "#2A9D8F",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {dailyEntries.length > 0 && (
            <div className="mt-2 flex justify-between">
              <span className="text-[10px] text-gray-400">{dailyEntries[0].date}</span>
              <span className="text-[10px] text-gray-400">
                {dailyEntries[dailyEntries.length - 1].date}
              </span>
            </div>
          )}
        </motion.div>

        {/* Daily Donations Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Daily Donations</h3>
          {dailyEntries.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-300">
              No data yet
            </div>
          ) : (
            <div className="flex h-40 items-end gap-[2px]">
              {dailyEntries.map((d) => (
                <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className="min-h-[2px] w-full rounded-t-sm transition-all"
                    style={{
                      height: `${(d.donations / maxDonations) * 100}%`,
                      background: "linear-gradient(to top, #2A9D8F, #2A9D8F80)",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {dailyEntries.length > 0 && (
            <div className="mt-2 flex justify-between">
              <span className="text-[10px] text-gray-400">{dailyEntries[0].date}</span>
              <span className="text-[10px] text-gray-400">
                {dailyEntries[dailyEntries.length - 1].date}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Viral Effect Cards placeholder */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { icon: "👑", label: "Crown Effect" },
          { icon: "⚔️", label: "Battle Effect" },
          { icon: "🎯", label: "Dare Effect" },
        ].map((effect, idx) => (
          <motion.div
            key={effect.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.08 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">{effect.icon}</span>
              <h3 className="text-sm font-semibold text-gray-700">{effect.label}</h3>
            </div>
            <div className="py-4 text-center text-sm text-gray-300">
              No viral analytics data yet
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
