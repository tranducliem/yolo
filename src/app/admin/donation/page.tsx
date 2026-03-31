"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface NPO {
  id: string;
  name: string;
  region: string;
  target: string;
  allocation_ratio: number;
  total_donated: number;
  bank_info: string | null;
  created_at: string;
}

interface MonthlyDonation {
  month: string;
  membership: number;
  goods: number;
  additional: number;
  total: number;
}

const targetLabel: Record<string, string> = {
  dog: "Dog",
  cat: "Cat",
  both: "Both",
};

export default function DonationAdminPage() {
  const [npos, setNpos] = useState<NPO[]>([]);
  const [monthly, setMonthly] = useState<MonthlyDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagLabel, setNewTagLabel] = useState("");
  const [reportText, setReportText] = useState("");

  const fetchDonation = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/donation");
      if (!res.ok) return;
      const data = await res.json();
      setNpos(data.npos || []);
      setMonthly(data.monthly || []);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonation();
  }, [fetchDonation]);

  // Compute from real data
  const currentMonthData = monthly.length > 0 ? monthly[0] : null;
  const totalDonation = currentMonthData?.total || 0;
  const totalAllDonations = npos.reduce((s, n) => s + (n.total_donated || 0), 0);

  const kpis = [
    { icon: "💰", label: "This Month Donations", value: `Y${totalDonation.toLocaleString()}` },
    { icon: "🏥", label: "NPO Partners", value: String(npos.length) },
    { icon: "📊", label: "Total All-Time", value: `Y${totalAllDonations.toLocaleString()}` },
    { icon: "📈", label: "Months Tracked", value: String(monthly.length) },
  ];

  // Monthly chart data (last 6 months)
  const recentMonthly = monthly.slice(0, 6).reverse();
  const maxMonthly = Math.max(1, ...recentMonthly.map((m) => m.total));

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="mb-8 h-64 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#0D1B2A]">Donation Management</h1>

      {/* Section 1: KPI Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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

      {/* Section 2: Monthly Donation Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm"
      >
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          Monthly Donation Trend (6 months)
        </h3>
        {recentMonthly.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No monthly data yet</div>
        ) : (
          <div className="space-y-2">
            {recentMonthly.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-16 text-xs text-gray-500">{m.month}</span>
                <div className="flex h-5 flex-1 overflow-hidden rounded-sm">
                  <div
                    className="bg-[#2A9D8F]"
                    style={{
                      width: `${(m.membership / maxMonthly) * 100}%`,
                    }}
                    title={`Membership Y${m.membership.toLocaleString()}`}
                  />
                  <div
                    className="bg-emerald-400"
                    style={{
                      width: `${(m.goods / maxMonthly) * 100}%`,
                    }}
                    title={`Goods Y${m.goods.toLocaleString()}`}
                  />
                  <div
                    className="bg-teal-300"
                    style={{
                      width: `${(m.additional / maxMonthly) * 100}%`,
                    }}
                    title={`Additional Y${m.additional.toLocaleString()}`}
                  />
                </div>
                <span className="w-24 text-right text-xs font-medium text-gray-700">
                  Y{m.total.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="mt-2 flex justify-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-[#2A9D8F]" />
                <span className="text-[10px] text-gray-500">Membership</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-emerald-400" />
                <span className="text-[10px] text-gray-500">Goods</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-teal-300" />
                <span className="text-[10px] text-gray-500">Additional</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Section 3: NPO Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">NPO Management</h3>
          <button className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-xs text-white transition-all duration-200 hover:opacity-90">
            Add NPO
          </button>
        </div>
        {npos.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No NPOs registered yet</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D1B2A] text-white">
                    <th className="rounded-tl-lg px-2 py-3 text-left font-medium">NPO Name</th>
                    <th className="px-2 py-3 text-left font-medium">Region</th>
                    <th className="px-2 py-3 text-center font-medium">Target</th>
                    <th className="px-2 py-3 text-center font-medium">Allocation</th>
                    <th className="rounded-tr-lg px-2 py-3 text-right font-medium">
                      Total Donated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {npos.map((npo, npoIdx) => (
                    <tr
                      key={npo.id}
                      className={`border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 ${npoIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-2 py-3 font-medium text-gray-900">{npo.name}</td>
                      <td className="px-2 py-3 text-gray-600">{npo.region}</td>
                      <td className="px-2 py-3 text-center">
                        {targetLabel[npo.target] || npo.target}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-3 w-24 rounded-full bg-gray-100">
                            <div
                              className="h-3 rounded-full bg-[#2A9D8F] transition-all"
                              style={{ width: `${npo.allocation_ratio}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs font-bold text-gray-700">
                            {npo.allocation_ratio}%
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right font-medium text-emerald-700 tabular-nums">
                        Y{(npo.total_donated || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Total allocation:</span>
              <span className="text-xs font-bold text-[#2A9D8F]">
                {npos.reduce((s, n) => s + (n.allocation_ratio || 0), 0)}%
              </span>
            </div>
          </>
        )}
      </motion.div>

      {/* Section 4: Monthly Report Creation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Monthly Report</h3>
          <button
            onClick={() => setShowReportPreview(!showReportPreview)}
            className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-xs text-white transition-all duration-200 hover:opacity-90"
          >
            {showReportPreview ? "Close Preview" : "Create Report"}
          </button>
        </div>

        {showReportPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <div className="mb-4">
                <label className="mb-1 block text-xs text-gray-500">Report Text</label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={4}
                  placeholder="Enter report content..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs text-gray-500">Upload Photos</label>
                <div className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-[#2A9D8F]">
                  <p className="text-sm text-gray-400">Click or drag & drop</p>
                </div>
              </div>

              <button className="w-full rounded-xl bg-[#2A9D8F] py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90">
                Distribute to All Users
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Section 5: Donation Tag Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Donation Tag Management</h3>
          <button
            onClick={() => setShowNewTagForm(!showNewTagForm)}
            className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-xs text-white transition-all duration-200 hover:opacity-90"
          >
            Create New Tag
          </button>
        </div>

        {showNewTagForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 overflow-hidden"
          >
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Tag Name</label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="#YOLO..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Label</label>
                  <input
                    type="text"
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    placeholder="Display name..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                  />
                </div>
              </div>
              <button className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-xs text-white transition-all duration-200 hover:opacity-90">
                Create Tag
              </button>
            </div>
          </motion.div>
        )}

        <div className="py-8 text-center text-sm text-gray-400">
          No donation tags configured. Tags will be managed via the database.
        </div>
      </motion.div>

      {/* Section 6: Execution History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Execution History</h3>
          <button className="rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-200">
            CSV Export
          </button>
        </div>
        <div className="py-8 text-center text-sm text-gray-400">
          No execution history yet. Records will appear after donations are processed.
        </div>
      </motion.div>
    </div>
  );
}
