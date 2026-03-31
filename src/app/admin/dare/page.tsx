"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Dare {
  id: string;
  theme: string;
  hashtag: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "scheduled" | "active" | "ended" | "draft";
  rewards: { first: number; second: number; third: number; participation: number };
  is_donation_challenge: boolean;
  participants?: number;
  posts?: number;
  created_at: string;
}

const donationTags = ["#YOLO Save Dogs", "#YOLO Cat Lives", "#YOLO Charity"];

const statusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">Active</span>
      );
    case "ended":
      return (
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">Ended</span>
      );
    case "scheduled":
      return (
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">Scheduled</span>
      );
    case "draft":
      return (
        <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-600">Draft</span>
      );
    default:
      return null;
  }
};

export default function DareAdminPage() {
  const [dares, setDares] = useState<Dare[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"list" | "create" | "calendar">("list");
  const [theme, setTheme] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [isDonationChallenge, setIsDonationChallenge] = useState(false);
  const [selectedDonationTags, setSelectedDonationTags] = useState<string[]>([]);

  const fetchDares = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dare");
      if (!res.ok) return;
      const data = await res.json();
      setDares(data.dares || []);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDares();
  }, [fetchDares]);

  const activeDare = dares.find((d) => d.status === "active");

  // Build calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const calendarDays: (number | null)[] = Array.from({ length: firstDow }, () => null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  // Map dares to dates
  const dareDateMap: Record<number, { theme: string; status: string; isDonation: boolean }> = {};
  dares.forEach((d) => {
    const s = new Date(d.start_date);
    const e = new Date(d.end_date);
    for (let dt = new Date(s); dt <= e; dt.setDate(dt.getDate() + 1)) {
      if (dt.getMonth() === month && dt.getFullYear() === year) {
        dareDateMap[dt.getDate()] = {
          theme: d.theme,
          status: d.status,
          isDonation: !!d.is_donation_challenge,
        };
      }
    }
  });

  // Find weeks with no dare
  const weeks: number[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7).filter((d): d is number => d !== null));
  }
  const emptyWeeks = weeks.filter((w) => w.length > 0 && w.every((d) => !dareDateMap[d]));

  // Calculate remaining days for active dare
  const remainDays = activeDare
    ? Math.max(0, Math.ceil((new Date(activeDare.end_date).getTime() - Date.now()) / 86400000))
    : 0;

  const toggleDonationTag = (tag: string) => {
    setSelectedDonationTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-8 h-40 animate-pulse rounded-2xl bg-gray-100" />
        <div className="mb-6 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
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
        Dare Management -- Weekly Challenge
      </motion.h1>

      {/* Current Dare */}
      {activeDare ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-700">Current Dare</h3>
            {statusBadge(activeDare.status)}
            {activeDare.is_donation_challenge && (
              <span className="rounded-full bg-[#2A9D8F]/10 px-2 py-1 text-xs font-medium text-[#2A9D8F]">
                Donation Challenge
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-1 text-xs text-gray-400">Theme</p>
              <p className="text-lg font-bold text-[#0D1B2A]">{activeDare.theme}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-1 text-xs text-gray-400">Participants</p>
              <p className="text-lg font-bold text-[#0D1B2A] tabular-nums">
                {(activeDare.participants || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-1 text-xs text-gray-400">Posts</p>
              <p className="text-lg font-bold text-[#0D1B2A] tabular-nums">
                {(activeDare.posts || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-[#2A9D8F]/10 p-4">
              <p className="mb-1 text-xs text-[#2A9D8F]">Days Left</p>
              <p className="text-lg font-bold text-[#2A9D8F]">{remainDays} days</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="py-8 text-center text-gray-400">No active dare currently</div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {(
          [
            ["list", "List"],
            ["create", "Create New"],
            ["calendar", "Calendar"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              tab === key
                ? "bg-[#2A9D8F] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List Tab */}
      <AnimatePresence mode="wait">
        {tab === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            {dares.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No dares created yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0D1B2A] text-white">
                      <th className="rounded-tl-lg px-2 py-3 text-left font-medium">Theme</th>
                      <th className="px-2 py-3 text-left font-medium">Period</th>
                      <th className="px-2 py-3 text-right font-medium">Participants</th>
                      <th className="px-2 py-3 text-right font-medium">Posts</th>
                      <th className="px-2 py-3 text-center font-medium">Donation</th>
                      <th className="rounded-tr-lg px-2 py-3 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dares.map((d, dIdx) => (
                      <tr
                        key={d.id}
                        className={`border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 ${dIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-2 py-3 font-medium text-gray-900">{d.theme}</td>
                        <td className="px-2 py-3 text-gray-600">
                          {d.start_date} -- {d.end_date}
                        </td>
                        <td className="px-2 py-3 text-right text-gray-700">
                          {(d.participants || 0).toLocaleString()}
                        </td>
                        <td className="px-2 py-3 text-right text-gray-700">
                          {(d.posts || 0).toLocaleString()}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {d.is_donation_challenge ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#2A9D8F]/10 px-2 py-1 text-xs font-semibold text-[#2A9D8F]">
                              Donation
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center">{statusBadge(d.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Create Tab */}
        {tab === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 text-sm font-semibold text-gray-700">Create New Dare</h3>
            <div className="max-w-xl space-y-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Theme</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="#SnackTime"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Description (max 200)</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value.slice(0, 200))}
                  placeholder="Describe the challenge..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">{desc.length}/200</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Donation Challenge checkbox */}
              <div className="rounded-xl border border-[#2A9D8F]/20 bg-[#2A9D8F]/5 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isDonationChallenge}
                    onChange={(e) => {
                      setIsDonationChallenge(e.target.checked);
                      if (!e.target.checked) setSelectedDonationTags([]);
                    }}
                    className="h-5 w-5 rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0D1B2A]">
                      Set as Donation Challenge
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Donation tags auto-applied, each post triggers a donation
                    </p>
                  </div>
                </label>

                <AnimatePresence>
                  {isDonationChallenge && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <p className="mb-2 text-xs text-gray-500">Select donation tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {donationTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleDonationTag(tag)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              selectedDonationTags.includes(tag)
                                ? "bg-[#2A9D8F] text-white"
                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-500">Rewards</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl bg-yellow-50 p-3 text-center">
                    <p className="mb-1 text-xs text-yellow-600">1st</p>
                    <p className="text-sm font-bold text-yellow-700">500 Paw</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="mb-1 text-xs text-gray-500">2nd-3rd</p>
                    <p className="text-sm font-bold text-gray-700">300 Paw</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="mb-1 text-xs text-gray-500">Participation</p>
                    <p className="text-sm font-bold text-gray-700">50 Paw</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="mb-1 text-xs text-gray-500">Total Budget</p>
                    <p className="text-sm font-bold text-gray-700">~50,000 Paw</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Hashtag</label>
                <input
                  type="text"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  placeholder="#YOLODare"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
                />
              </div>
              <button className="w-full rounded-xl bg-[#2A9D8F] py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90">
                Create Dare
              </button>
            </div>
          </motion.div>
        )}

        {/* Calendar Tab */}
        {tab === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              {year}/{String(month + 1).padStart(2, "0")}
            </h3>
            <div className="mb-2 grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="h-16" />;
                const dareInfo = dareDateMap[day];
                const isToday = day === now.getDate();
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: day * 0.01 }}
                    className={`h-16 rounded-lg border p-1 text-xs transition-colors ${
                      dareInfo
                        ? dareInfo.isDonation
                          ? "border-[#2A9D8F]/30 bg-[#2A9D8F]/10"
                          : dareInfo.status === "active"
                            ? "border-green-200 bg-green-50"
                            : dareInfo.status === "draft"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-blue-200 bg-blue-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <span className={`font-medium ${isToday ? "text-[#2A9D8F]" : "text-gray-700"}`}>
                      {day}
                    </span>
                    {dareInfo && (
                      <p className="mt-0.5 truncate text-[10px] text-gray-500">
                        {dareInfo.isDonation && "* "}
                        {dareInfo.theme}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {emptyWeeks.length > 0 && (
              <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
                Weeks without a dare: {emptyWeeks.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
