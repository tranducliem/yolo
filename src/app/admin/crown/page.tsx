/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CrownEntry {
  id: string;
  pet_id: string;
  date: string;
  vote_count: number;
  views: number;
  likes: number;
  shares: number;
  mode: "auto" | "manual";
  created_at: string;
  pets: {
    name: string;
    avatar_url: string | null;
    users: { display_name: string };
  };
}

export default function CrownAdminPage() {
  const [history, setHistory] = useState<CrownEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [countdown, setCountdown] = useState("");

  const fetchCrown = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/crown");
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrown();
  }, [fetchCrown]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayCrown = history.length > 0 ? history[0] : null;
  const perPage = 7;
  const totalPages = Math.max(1, Math.ceil(history.length / perPage));
  const pagedHistory = history.slice(page * perPage, (page + 1) * perPage);

  const handleCSVExport = () => {
    const header = "Date,Pet,Owner,Views,Likes,Shares,Mode\n";
    const rows = history
      .map(
        (h) =>
          `${h.date},${h.pets?.name || ""},${h.pets?.users?.display_name || ""},${h.views || 0},${h.likes || 0},${h.shares || 0},${h.mode}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crown_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-8 h-56 animate-pulse rounded-2xl bg-gray-100" />
        <div className="mb-8 h-20 animate-pulse rounded-2xl bg-gray-100" />
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
        Crown Management -- Today&apos;s Pick
      </motion.h1>

      {/* Current Crown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        {todayCrown ? (
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative h-48 w-48 shrink-0">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-48 w-48 overflow-hidden rounded-2xl ring-4 ring-[#E9C46A]/40"
              >
                {todayCrown.pets?.avatar_url ? (
                  <img
                    src={todayCrown.pets.avatar_url}
                    alt={todayCrown.pets.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-4xl">
                    👑
                  </div>
                )}
              </motion.div>
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -top-3 -right-3 text-4xl"
              >
                👑
              </motion.span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="mb-1 text-3xl font-bold text-[#0D1B2A]">
                {todayCrown.pets?.name || "Unknown"}
              </h2>
              <p className="mb-2 text-gray-500">
                Owner: {todayCrown.pets?.users?.display_name || "Unknown"}
              </p>
              <p className="mb-4 text-sm text-gray-400">
                Date: {todayCrown.date} / Mode:{" "}
                {todayCrown.mode === "auto" ? "Auto (AI)" : "Manual"}
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                <div className="rounded-xl bg-gray-50 px-4 py-2 text-center">
                  <p className="text-xs text-gray-400">Views</p>
                  <p className="text-lg font-bold text-[#0D1B2A] tabular-nums">
                    {(todayCrown.views || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-2 text-center">
                  <p className="text-xs text-gray-400">Likes</p>
                  <p className="text-lg font-bold text-[#0D1B2A] tabular-nums">
                    {(todayCrown.likes || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-2 text-center">
                  <p className="text-xs text-gray-400">Shares</p>
                  <p className="text-lg font-bold text-[#0D1B2A] tabular-nums">
                    {todayCrown.shares || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-[#2A9D8F]/10 px-4 py-2 text-center">
                  <p className="text-xs text-[#2A9D8F]">Time Left</p>
                  <p className="font-mono text-lg font-bold text-[#2A9D8F]">{countdown}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">No crown selected yet today</div>
        )}
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Selection Mode</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("auto")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
              mode === "auto"
                ? "bg-[#2A9D8F] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Auto (AI Score)
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
              mode === "manual"
                ? "bg-[#2A9D8F] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Manual
          </button>
        </div>
      </motion.div>

      {/* Manual Selection */}
      <AnimatePresence>
        {mode === "manual" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Manual Selection</h3>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
            />
            <div className="py-8 text-center text-sm text-gray-400">
              No candidates available. Connect to pet rankings to enable manual selection.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Crown History</h3>
          <button
            onClick={handleCSVExport}
            className="rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-600 transition-all duration-200 hover:bg-gray-200"
          >
            CSV Export
          </button>
        </div>
        {history.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No crown history yet</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D1B2A] text-white">
                    <th className="rounded-tl-lg px-2 py-3 text-left font-medium">Date</th>
                    <th className="px-2 py-3 text-left font-medium">Pet</th>
                    <th className="px-2 py-3 text-left font-medium">Owner</th>
                    <th className="px-2 py-3 text-right font-medium">Views</th>
                    <th className="px-2 py-3 text-right font-medium">Likes</th>
                    <th className="px-2 py-3 text-right font-medium">Shares</th>
                    <th className="rounded-tr-lg px-2 py-3 text-center font-medium">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedHistory.map((h, hIdx) => (
                    <tr
                      key={h.id || h.date}
                      className={`border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 ${hIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-2 py-3 text-gray-700">{h.date}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-200">
                            {h.pets?.avatar_url && (
                              <img
                                src={h.pets.avatar_url}
                                alt={h.pets.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            {h.pets?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-gray-600">
                        {h.pets?.users?.display_name || "Unknown"}
                      </td>
                      <td className="px-2 py-3 text-right text-gray-700">
                        {(h.views || 0).toLocaleString()}
                      </td>
                      <td className="px-2 py-3 text-right text-gray-700">
                        {(h.likes || 0).toLocaleString()}
                      </td>
                      <td className="px-2 py-3 text-right text-gray-700">{h.shares || 0}</td>
                      <td className="px-2 py-3 text-center">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            h.mode === "auto"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {h.mode === "auto" ? "Auto" : "Manual"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all duration-200 hover:bg-gray-200 disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                    page === i
                      ? "bg-[#2A9D8F] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all duration-200 hover:bg-gray-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
