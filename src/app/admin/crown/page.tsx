"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockPets, mockCrownHistory } from "@/lib/mockData";

export default function CrownAdminPage() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [countdown, setCountdown] = useState("");

  const todayCrown = mockCrownHistory[0];
  const perPage = 7;
  const totalPages = Math.ceil(mockCrownHistory.length / perPage);
  const pagedHistory = mockCrownHistory.slice(page * perPage, (page + 1) * perPage);

  // Sort pets by score for AI ranking
  const sortedPets = [...mockPets].sort((a, b) => b.score - a.score).slice(0, 10);
  const filteredCandidates = sortedPets.filter(
    (p) => p.name.includes(search) || p.ownerName.includes(search) || p.breed.includes(search)
  );

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCSVExport = () => {
    const header = "日付,ペット名,オーナー,閲覧数,いいね,シェア,モード\n";
    const rows = mockCrownHistory
      .map((h) => `${h.date},${h.petName},${h.ownerName},${h.views},${h.likes},${h.shares},${h.mode}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crown_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#0D1B2A] mb-6"
      >
        Crown管理 &mdash; 今日の1匹
      </motion.h1>

      {/* Current Crown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative w-48 h-48 shrink-0">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-48 h-48 rounded-2xl overflow-hidden ring-4 ring-[#E9C46A]/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={todayCrown.imageUrl} alt={todayCrown.petName} className="w-full h-full object-cover" />
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
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-1">{todayCrown.petName}</h2>
            <p className="text-gray-500 mb-2">オーナー: {todayCrown.ownerName}</p>
            <p className="text-sm text-gray-400 mb-4">
              選出日: {todayCrown.date} / モード: {todayCrown.mode === "auto" ? "自動(AI)" : "手動"}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-gray-50 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-gray-400">閲覧</p>
                <p className="text-lg font-bold tabular-nums text-[#0D1B2A]">{todayCrown.views.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-gray-400">いいね</p>
                <p className="text-lg font-bold tabular-nums text-[#0D1B2A]">{todayCrown.likes.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-gray-400">シェア</p>
                <p className="text-lg font-bold tabular-nums text-[#0D1B2A]">{todayCrown.shares}</p>
              </div>
              <div className="bg-[#2A9D8F]/10 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-[#2A9D8F]">残り時間</p>
                <p className="text-lg font-bold text-[#2A9D8F] font-mono">{countdown}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-4">選出モード</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("auto")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mode === "auto" ? "bg-[#2A9D8F] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            自動（AIスコア順）
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mode === "manual" ? "bg-[#2A9D8F] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            手動
          </button>
        </div>
      </motion.div>

      {/* Manual Selection — TOP 10 candidates */}
      <AnimatePresence>
        {mode === "manual" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8 overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">手動選出 &mdash; AIスコアTOP10</h3>
            <input
              type="text"
              placeholder="名前・オーナー・犬種で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
            />
            <div className="space-y-2">
              {filteredCandidates.map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-[#2A9D8F]/5 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-400 w-6 text-center">{i + 1}</span>
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{pet.name}</p>
                    <p className="text-xs text-gray-400">
                      {pet.breed} / {pet.ownerName}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#2A9D8F]">スコア {pet.score}</span>
                  <button className="bg-[#2A9D8F] text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-all duration-200">
                    選出
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Crown履歴</h3>
          <button
            onClick={handleCSVExport}
            className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            CSVエクスポート
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D1B2A] text-white">
                <th className="text-left py-3 px-2 font-medium rounded-tl-lg">日付</th>
                <th className="text-left py-3 px-2 font-medium">ペット</th>
                <th className="text-left py-3 px-2 font-medium">オーナー</th>
                <th className="text-right py-3 px-2 font-medium">閲覧</th>
                <th className="text-right py-3 px-2 font-medium">いいね</th>
                <th className="text-right py-3 px-2 font-medium">シェア</th>
                <th className="text-center py-3 px-2 font-medium rounded-tr-lg">モード</th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.map((h, hIdx) => (
                <tr key={h.date} className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${hIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                  <td className="py-3 px-2 text-gray-700">{h.date}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={h.imageUrl} alt={h.petName} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-gray-900 font-medium">{h.petName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{h.ownerName}</td>
                  <td className="py-3 px-2 text-right text-gray-700">{h.views.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-gray-700">{h.likes.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-gray-700">{h.shares}</td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        h.mode === "auto" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {h.mode === "auto" ? "自動" : "手動"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-all duration-200"
          >
            前へ
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                page === i ? "bg-[#2A9D8F] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-all duration-200"
          >
            次へ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
