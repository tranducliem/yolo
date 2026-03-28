"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockDares, donationTags } from "@/lib/mockData";

const statusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full">進行中</span>;
    case "ended":
      return <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">終了</span>;
    case "scheduled":
      return <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">予定</span>;
    case "draft":
      return <span className="bg-yellow-50 text-yellow-600 text-xs px-2 py-1 rounded-full">下書き</span>;
    default:
      return null;
  }
};

export default function DareAdminPage() {
  const [tab, setTab] = useState<"list" | "create" | "calendar">("list");
  const [theme, setTheme] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [isDonationChallenge, setIsDonationChallenge] = useState(false);
  const [selectedDonationTags, setSelectedDonationTags] = useState<string[]>([]);

  const activeDare = mockDares.find((d) => d.status === "active");

  // Build calendar for current month
  const now = new Date(2026, 2, 1); // March 2026
  const daysInMonth = new Date(2026, 3, 0).getDate();
  const firstDow = now.getDay();
  const calendarDays: (number | null)[] = Array.from({ length: firstDow }, () => null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  // Map dares to dates
  const dareDateMap: Record<number, { theme: string; status: string; isDonation: boolean }> = {};
  mockDares.forEach((d) => {
    const s = new Date(d.startDate);
    const e = new Date(d.endDate);
    for (let dt = new Date(s); dt <= e; dt.setDate(dt.getDate() + 1)) {
      if (dt.getMonth() === 2 && dt.getFullYear() === 2026) {
        dareDateMap[dt.getDate()] = { theme: d.theme, status: d.status, isDonation: !!d.isDonationChallenge };
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
    ? Math.max(0, Math.ceil((new Date(activeDare.endDate).getTime() - new Date(2026, 2, 27).getTime()) / 86400000))
    : 0;

  const toggleDonationTag = (tag: string) => {
    setSelectedDonationTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#0D1B2A] mb-6"
      >
        Dare管理 &mdash; 週次チャレンジ
      </motion.h1>

      {/* Current Dare */}
      {activeDare && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-700">現在のDare</h3>
            {statusBadge(activeDare.status)}
            {activeDare.isDonationChallenge && (
              <span className="bg-[#2A9D8F]/10 text-[#2A9D8F] text-xs px-2 py-1 rounded-full font-medium">
                寄付チャレンジ
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">テーマ</p>
              <p className="text-lg font-bold text-[#0D1B2A]">{activeDare.theme}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">参加者数</p>
              <p className="text-lg font-bold tabular-nums text-[#0D1B2A]">{activeDare.participants.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">投稿数</p>
              <p className="text-lg font-bold tabular-nums text-[#0D1B2A]">{activeDare.posts.toLocaleString()}</p>
            </div>
            <div className="bg-[#2A9D8F]/10 rounded-xl p-4">
              <p className="text-xs text-[#2A9D8F] mb-1">残り日数</p>
              <p className="text-lg font-bold text-[#2A9D8F]">{remainDays}日</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            ["list", "一覧"],
            ["create", "新規作成"],
            ["calendar", "カレンダー"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === key
                ? "bg-[#2A9D8F] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
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
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D1B2A] text-white">
                    <th className="text-left py-3 px-2 font-medium rounded-tl-lg">テーマ</th>
                    <th className="text-left py-3 px-2 font-medium">期間</th>
                    <th className="text-right py-3 px-2 font-medium">参加者</th>
                    <th className="text-right py-3 px-2 font-medium">投稿数</th>
                    <th className="text-center py-3 px-2 font-medium">寄付</th>
                    <th className="text-center py-3 px-2 font-medium rounded-tr-lg">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDares.map((d, dIdx) => (
                    <tr key={d.id} className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${dIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-3 px-2 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {d.theme}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {d.startDate} 〜 {d.endDate}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-700">{d.participants.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-gray-700">{d.posts.toLocaleString()}</td>
                      <td className="py-3 px-2 text-center">
                        {d.isDonationChallenge ? (
                          <span className="inline-flex items-center gap-1 bg-[#2A9D8F]/10 text-[#2A9D8F] text-xs px-2 py-1 rounded-full font-semibold">
                            🌟 寄付
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">{statusBadge(d.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Create Tab */}
        {tab === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-5">新規Dare作成</h3>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs text-gray-500 mb-1">テーマ</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="#おやつタイム"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">説明（200文字以内）</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value.slice(0, 200))}
                  placeholder="チャレンジの説明を入力..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{desc.length}/200</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">開始日</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">終了日</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                </div>
              </div>

              {/* Donation Challenge checkbox */}
              <div className="bg-[#2A9D8F]/5 rounded-xl p-4 border border-[#2A9D8F]/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDonationChallenge}
                    onChange={(e) => {
                      setIsDonationChallenge(e.target.checked);
                      if (!e.target.checked) setSelectedDonationTags([]);
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0D1B2A]">🌟 寄付チャレンジとして設定</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      このDareの投稿に寄付タグが自動付与され、投稿ごとに寄付が発生します
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
                      <p className="text-xs text-gray-500 mb-2">寄付タグを選択:</p>
                      <div className="flex flex-wrap gap-2">
                        {donationTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleDonationTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              selectedDonationTags.includes(tag)
                                ? "bg-[#2A9D8F] text-white"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
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
                <label className="block text-xs text-gray-500 mb-2">報酬設定</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-yellow-600 mb-1">1位</p>
                    <p className="text-sm font-bold text-yellow-700">500 Paw</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">2-3位</p>
                    <p className="text-sm font-bold text-gray-700">300 Paw</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">参加賞</p>
                    <p className="text-sm font-bold text-gray-700">50 Paw</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">合計予算</p>
                    <p className="text-sm font-bold text-gray-700">~50,000 Paw</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ハッシュタグ</label>
                <input
                  type="text"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  placeholder="#YOLODare"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                />
              </div>
              <button className="w-full bg-[#2A9D8F] text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200">
                Dareを作成
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
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">2026年3月</h3>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 py-2 font-medium">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="h-16" />;
                const dareInfo = dareDateMap[day];
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: day * 0.01 }}
                    className={`h-16 rounded-lg p-1 text-xs border transition-colors ${
                      dareInfo
                        ? dareInfo.isDonation
                          ? "bg-[#2A9D8F]/10 border-[#2A9D8F]/30"
                          : dareInfo.status === "active"
                          ? "bg-green-50 border-green-200"
                          : dareInfo.status === "draft"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <span className={`font-medium ${day === 27 ? "text-[#2A9D8F]" : "text-gray-700"}`}>{day}</span>
                    {dareInfo && (
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {dareInfo.isDonation && "🌟"}
                        {dareInfo.theme}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {emptyWeeks.length > 0 && (
              <div className="mt-4 bg-yellow-50 rounded-xl p-3 text-sm text-yellow-700">
                Dareが設定されていない週があります（{emptyWeeks.length}週）
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
