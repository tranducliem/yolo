"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AMBASSADOR_RANKS } from "@/config/ambassador";

interface AdminUser {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  plan: "free" | "plus" | "pro" | "family";
  ambassador_level: number;
  donation_total: number;
  paw_points: number;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

const planLabel: Record<string, string> = {
  free: "Free",
  plus: "YOLO+",
  pro: "PRO",
  family: "FAMILY",
};

const planColor: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  plus: "bg-blue-50 text-blue-600",
  pro: "bg-purple-50 text-purple-600",
  family: "bg-yellow-50 text-yellow-700",
};

const ambassadorBadge = (level: number) => {
  const rank = AMBASSADOR_RANKS.find((r) => r.level === level);
  if (!rank || level === 0) return null;
  const bgColors: Record<number, string> = {
    1: "bg-green-50 text-green-700 border-green-200",
    2: "bg-blue-50 text-blue-700 border-blue-200",
    3: "bg-yellow-50 text-yellow-700 border-yellow-200",
    4: "bg-purple-50 text-purple-700 border-purple-200",
    5: "bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${bgColors[level] || ""}`}
    >
      {rank.emoji} Lv{level}
    </span>
  );
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterAmbassador, setFilterAmbassador] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPlan !== "all") params.set("plan", filterPlan);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, [filterPlan]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    if (filterAmbassador !== "all") {
      if (filterAmbassador === "0" && u.ambassador_level !== 0) return false;
      if (filterAmbassador !== "0" && u.ambassador_level !== Number(filterAmbassador)) return false;
    }
    return true;
  });

  // Ambassador level distribution
  const ambassadorDistribution = AMBASSADOR_RANKS.map((rank) => ({
    ...rank,
    count: users.filter((u) => u.ambassador_level === rank.level).length,
  }));
  const noAmbassadorCount = users.filter((u) => u.ambassador_level === 0).length;
  const totalUsersForBar = users.length || 1;

  const kpis = [
    { icon: "👥", label: "Total Users", value: total.toLocaleString() },
    {
      icon: "💎",
      label: "Paid Users",
      value: users.filter((u) => u.plan !== "free").length.toLocaleString(),
    },
    {
      icon: "🌟",
      label: "Ambassadors",
      value: users.filter((u) => u.ambassador_level > 0).length.toLocaleString(),
    },
    {
      icon: "🚫",
      label: "Banned",
      value: users.filter((u) => u.is_banned).length.toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="mb-8 h-48 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
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
        User Management
      </motion.h1>

      {/* KPI Cards */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-sm text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Ambassador Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Ambassador Distribution</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="mb-1 text-xs text-gray-400">None</p>
            <p className="text-xl font-bold text-gray-700 tabular-nums">{noAmbassadorCount}</p>
          </div>
          {ambassadorDistribution.map((rank) => (
            <div
              key={rank.level}
              className="rounded-xl border border-[#2A9D8F]/10 bg-gradient-to-b from-[#2A9D8F]/5 to-white p-3 text-center"
            >
              <p className="mb-1 text-xs text-gray-500">
                {rank.emoji} Lv{rank.level}
              </p>
              <p className="text-xl font-bold text-[#0D1B2A] tabular-nums">{rank.count}</p>
              <p className="text-[10px] text-gray-400">{rank.name}</p>
            </div>
          ))}
        </div>
        {/* Mini bar chart */}
        <div className="mt-4 flex h-12 items-end gap-1">
          <div className="flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t-sm bg-gray-300"
              style={{
                height: `${Math.max(4, (noAmbassadorCount / totalUsersForBar) * 100)}%`,
              }}
            />
            <span className="mt-1 text-[9px] text-gray-400">-</span>
          </div>
          {ambassadorDistribution.map((rank) => (
            <div key={rank.level} className="flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${Math.max(4, (rank.count / totalUsersForBar) * 100)}%`,
                  backgroundColor: "#2A9D8F",
                  opacity: 0.4 + rank.level * 0.12,
                }}
              />
              <span className="mt-1 text-[9px] text-gray-400">L{rank.level}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Plan</label>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="free">Free</option>
              <option value="plus">YOLO+</option>
              <option value="pro">PRO</option>
              <option value="family">FAMILY</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Ambassador</label>
            <select
              value={filterAmbassador}
              onChange={(e) => setFilterAmbassador(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="0">None</option>
              {AMBASSADOR_RANKS.map((r) => (
                <option key={r.level} value={String(r.level)}>
                  {r.emoji} Lv{r.level} {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1B2A] text-white">
                  <th className="rounded-tl-lg px-2 py-3 text-left font-medium">Name</th>
                  <th className="px-2 py-3 text-left font-medium">Email</th>
                  <th className="px-2 py-3 text-center font-medium">Plan</th>
                  <th className="px-2 py-3 text-center font-medium">Ambassador</th>
                  <th className="px-2 py-3 text-right font-medium">Donations</th>
                  <th className="px-2 py-3 text-right font-medium">Paw Points</th>
                  <th className="rounded-tr-lg px-2 py-3 text-left font-medium">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, userIdx) => (
                  <tr
                    key={user.id}
                    className={`cursor-pointer border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 ${userIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-2 py-3 font-medium text-gray-900">
                      {user.display_name || "Unknown"}
                      {user.is_banned && (
                        <span className="ml-2 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">
                          Banned
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-600">{user.email}</td>
                    <td className="px-2 py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${planColor[user.plan] || planColor.free}`}
                      >
                        {planLabel[user.plan] || user.plan}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      {user.ambassador_level > 0 ? (
                        ambassadorBadge(user.ambassador_level)
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {user.donation_total > 0 ? (
                        <span className="font-medium text-[#2A9D8F]">
                          Y{user.donation_total.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right text-gray-900">
                      {user.paw_points.toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* User Detail Slide Panel */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-xl text-gray-400 hover:text-gray-700"
                  >
                    X
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700">
                        {selectedUser.display_name || "Unknown"}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${planColor[selectedUser.plan] || planColor.free}`}
                        >
                          {planLabel[selectedUser.plan] || selectedUser.plan}
                        </span>
                        {selectedUser.ambassador_level > 0 &&
                          ambassadorBadge(selectedUser.ambassador_level)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Registered: {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                    {selectedUser.is_admin && (
                      <span className="mt-2 inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-600">
                        Admin
                      </span>
                    )}
                    {selectedUser.is_banned && (
                      <span className="mt-2 ml-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-600">
                        Banned
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-400">Paw Points</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedUser.paw_points.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-400">Donations</p>
                      <p className="text-lg font-bold text-gray-900">
                        Y{selectedUser.donation_total.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-400">Ambassador</p>
                      <p className="text-lg font-bold text-gray-900">
                        Lv{selectedUser.ambassador_level}
                      </p>
                    </div>
                  </div>

                  {/* Ambassador Detail */}
                  {selectedUser.ambassador_level > 0 && (
                    <div className="rounded-xl border border-[#2A9D8F]/20 bg-[#2A9D8F]/5 p-4">
                      <h4 className="mb-3 text-xs font-semibold text-[#2A9D8F]">Ambassador Info</h4>
                      <div className="flex items-center gap-2">
                        {ambassadorBadge(selectedUser.ambassador_level)}
                        <span className="text-sm text-gray-700">
                          {
                            AMBASSADOR_RANKS.find((r) => r.level === selectedUser.ambassador_level)
                              ?.name
                          }
                        </span>
                      </div>
                      <div className="mt-3 border-t border-[#2A9D8F]/10 pt-3">
                        <p className="mb-1 text-xs text-gray-500">Donation Multiplier</p>
                        <p className="text-sm font-semibold text-[#2A9D8F]">
                          x
                          {
                            AMBASSADOR_RANKS.find((r) => r.level === selectedUser.ambassador_level)
                              ?.donationMultiplier
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Admin Notes</label>
                    <textarea
                      placeholder="Enter notes..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 rounded-xl bg-[#2A9D8F] py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90">
                      Save
                    </button>
                    <button className="rounded-xl bg-red-50 px-6 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100">
                      Ban Account
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
