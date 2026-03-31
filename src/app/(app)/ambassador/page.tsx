"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AMBASSADOR_RANKS } from "@/config/ambassador";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/features/auth/AuthGate";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";
import type { PrefectureAmbassador, LegendEntry } from "@/types";

/* ── Region grouping ── */
const regionOrder = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州"];

function groupByRegion(ambassadors: PrefectureAmbassador[]) {
  const groups: Record<string, PrefectureAmbassador[]> = {};
  regionOrder.forEach((r) => {
    groups[r] = [];
  });
  ambassadors.forEach((p) => {
    if (groups[p.region]) groups[p.region].push(p);
  });
  return groups;
}

interface AmbassadorStatusData {
  currentLevel: number;
  levelName: string;
  multiplier: number;
  progress: { level: number; name: string; met: boolean; conditions: string[] }[];
}

function AmbassadorContent() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AmbassadorStatusData | null>(null);
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string | null>("関東");
  const [prefectureAmbassadors, setPrefectureAmbassadors] = useState<PrefectureAmbassador[]>([]);
  const [legends, setLegends] = useState<LegendEntry[]>([]);
  const [prefLoading, setPrefLoading] = useState(true);
  const [legendsLoading, setLegendsLoading] = useState(true);

  const fetchPrefectures = useCallback(async () => {
    try {
      const res = await fetch("/api/ambassador/prefectures");
      if (res.ok) {
        const data = await res.json();
        setPrefectureAmbassadors(data.prefectures || []);
      }
    } catch {
      /* no fallback */
    } finally {
      setPrefLoading(false);
    }
  }, []);

  const fetchLegends = useCallback(async () => {
    try {
      const res = await fetch("/api/ambassador/legends");
      if (res.ok) {
        const data = await res.json();
        setLegends(data.legends || []);
      }
    } catch {
      /* no fallback */
    } finally {
      setLegendsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/ambassador/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.currentLevel !== undefined) setStatus(d);
      })
      .catch(() => {});

    fetchPrefectures();
    fetchLegends();
  }, [fetchPrefectures, fetchLegends]);

  const userLevel = status?.currentLevel ?? user?.ambassadorLevel ?? 0;

  const regionGroups = groupByRegion(prefectureAmbassadors);

  // Find selected prefecture data
  const selectedPrefData = selectedPref
    ? prefectureAmbassadors.find((p) => p.prefecture === selectedPref)
    : null;

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="mb-2 text-4xl"
          >
            👑
          </motion.p>
          <h1 className="mb-1 text-3xl font-bold text-[#0D1B2A]">YOLO Ambassador Program</h1>
          <p className="text-sm text-[#9CA3AF]">あなたの活動が、もっと多くの命を救います</p>
        </motion.div>

        {/* ═══════ Section 1: Current Rank ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`mb-6 rounded-2xl p-6 text-center text-white shadow-lg ${
            userLevel >= 5
              ? "bg-gradient-to-br from-[#f472b6] via-[#a78bfa] to-[#38bdf8] shadow-purple-200"
              : userLevel >= 3
                ? "bg-gradient-to-br from-[#D4A843] to-[#B8860B] shadow-amber-200"
                : "bg-gradient-to-br from-[#2A9D8F] to-[#059669] shadow-teal-200"
          }`}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="mb-3 text-5xl"
          >
            {AMBASSADOR_RANKS[userLevel - 1]?.emoji || "🌱"}
          </motion.div>
          <p className="text-sm opacity-80">現在のランク</p>
          <p className="mb-1 text-2xl font-extrabold">
            Lv.{userLevel} {AMBASSADOR_RANKS[userLevel - 1]?.name || "サポーター"}
          </p>
          {user?.ambassadorRegion && (
            <p className="mb-3 text-sm opacity-90">
              👑 地域アンバサダー（{user.ambassadorRegion}）
            </p>
          )}
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
            <p className="mb-1 text-xs opacity-80">寄付倍率</p>
            <p className="text-3xl font-extrabold">
              {AMBASSADOR_RANKS[userLevel - 1]?.donationMultiplier || 1}x
            </p>
            <p className="mt-1 text-xs opacity-80">
              あなたの投稿は通常の{AMBASSADOR_RANKS[userLevel - 1]?.donationMultiplier || 1}
              倍の寄付を生みます
            </p>
          </div>
        </motion.div>

        {/* ═══════ Section 2: Rank List ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <h2 className="mb-4 text-lg font-bold text-[#0D1B2A]">📊 ランク一覧</h2>

          <div className="space-y-3">
            {AMBASSADOR_RANKS.map((rank, i) => {
              const isAchieved = rank.level <= userLevel;
              const isNext = rank.level === userLevel + 1;
              const isCurrent = rank.level === userLevel;
              const isLocked = rank.level > userLevel + 1;

              // Mock progress for next level
              const progress = isNext ? 65 : 0;

              return (
                <motion.div
                  key={rank.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`rounded-xl p-4 transition-all duration-200 ${
                    isCurrent
                      ? "border border-l-4 border-[#2A9D8F] border-l-[#2A9D8F] bg-[#2A9D8F]/5 shadow-sm"
                      : isAchieved
                        ? "border border-l-4 border-emerald-200 border-l-[#2A9D8F] bg-emerald-50/50"
                        : isNext
                          ? "border border-l-4 border-[#D4A843] border-l-[#D4A843] bg-amber-50/50"
                          : "border border-l-4 border-gray-200 border-l-gray-300 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{rank.emoji}</span>
                      <div>
                        <p
                          className={`text-sm font-bold ${isLocked ? "text-gray-400" : "text-gray-900"}`}
                        >
                          Lv.{rank.level} {rank.name}
                        </p>
                        <p className="text-[10px] text-gray-400">{rank.requiredPlan}</p>
                      </div>
                    </div>
                    <div>
                      {isAchieved && (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600">
                          ✅ 達成済み
                        </span>
                      )}
                      {isNext && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-[#D4A843]">
                          🔒 次の目標
                        </span>
                      )}
                      {isLocked && <span className="text-xs text-gray-400">🔒</span>}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="mb-2">
                    <p className="mb-1 text-[10px] font-bold text-gray-500">条件</p>
                    <div className="space-y-0.5">
                      {rank.conditions.map((c, ci) => (
                        <p
                          key={ci}
                          className={`text-xs ${isAchieved ? "text-emerald-600" : isLocked ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {isAchieved ? "✅" : "○"} {c}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-2">
                    <p className="mb-1 text-[10px] font-bold text-gray-500">特典</p>
                    <div className="flex flex-wrap gap-1">
                      {rank.benefits.map((b, bi) => (
                        <span
                          key={bi}
                          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            isAchieved
                              ? "bg-emerald-100 text-emerald-700"
                              : isLocked
                                ? "bg-gray-100 text-gray-400"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Donation multiplier */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500">寄付倍率:</span>
                    <span
                      className={`text-xs font-bold ${
                        isAchieved
                          ? "text-emerald-600"
                          : isLocked
                            ? "text-gray-400"
                            : "text-[#D4A843]"
                      }`}
                    >
                      {rank.donationMultiplier}x
                    </span>
                  </div>

                  {/* Progress bar for next level */}
                  {isNext && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] text-[#D4A843]">
                        <span>達成度</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#D4A843] to-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════ Section 3: National Ambassador Map ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-bold text-[#0D1B2A]">🗾 全国アンバサダーマップ</h2>
          <p className="mb-4 text-sm text-[#9CA3AF]">地域ごとに犬・猫各1名の枠があります</p>

          {prefLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : prefectureAmbassadors.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              まだアンバサダーデータがありません
            </div>
          ) : (
            <div className="space-y-3">
              {regionOrder.map((region) => {
                const prefs = regionGroups[region];
                const filledCount = prefs.filter((p) => p.dog || p.cat).length;
                const isExpanded = expandedRegion === region;

                return (
                  <div key={region}>
                    <button
                      onClick={() => setExpandedRegion(isExpanded ? null : region)}
                      className={`flex w-full items-center justify-between rounded-xl p-3 transition-all duration-200 ${
                        filledCount > 0
                          ? "bg-[#D4A843]/10 hover:bg-[#D4A843]/20"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">{region}</span>
                        <span className="text-[10px] text-gray-400">({prefs.length}都道府県)</span>
                        {filledCount > 0 && (
                          <span className="rounded-full bg-[#D4A843]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#D4A843]">
                            {filledCount}名活動中
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      >
                        &rsaquo;
                      </span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-3 gap-2 p-2">
                            {prefs.map((pref) => {
                              const hasDog = !!pref.dog;
                              const hasCat = !!pref.cat;
                              const filled = hasDog || hasCat;

                              return (
                                <button
                                  key={pref.prefecture}
                                  onClick={() => setSelectedPref(pref.prefecture)}
                                  className={`rounded-lg p-2 text-center text-xs font-medium transition-all duration-200 ${
                                    filled
                                      ? "border border-[#D4A843] bg-gradient-to-br from-[#D4A843]/20 to-[#D4A843]/10 text-[#D4A843] hover:scale-105 hover:shadow-sm"
                                      : "border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100"
                                  }`}
                                >
                                  <span>{pref.prefecture}</span>
                                  <div className="mt-0.5 flex justify-center gap-1">
                                    {hasDog && <span className="text-[10px]">🐶</span>}
                                    {hasCat && <span className="text-[10px]">🐱</span>}
                                    {!filled && <span className="text-[10px]">---</span>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Prefecture detail modal */}
        <AnimatePresence>
          {selectedPref && selectedPrefData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
              onClick={() => setSelectedPref(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
              >
                <h3 className="mb-4 text-center text-lg font-bold">
                  🗾 {selectedPrefData.prefecture}
                </h3>

                {/* Dog ambassador */}
                <div className="mb-3">
                  <p className="mb-2 text-xs font-bold text-gray-500">🐶 犬アンバサダー</p>
                  {selectedPrefData.dog ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[#D4A843]/20 bg-[#D4A843]/5 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPrefData.dog.imageUrl}
                        alt={selectedPrefData.dog.petName}
                        className="h-12 w-12 rounded-full border-2 border-[#D4A843] object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold">{selectedPrefData.dog.name}</p>
                        <p className="text-xs text-gray-500">{selectedPrefData.dog.petName}</p>
                        <p className="text-[10px] text-emerald-600">
                          寄付 ¥{selectedPrefData.dog.donationTotal.toLocaleString()} /{" "}
                          {selectedPrefData.dog.postCount}投稿
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-400">空席</p>
                    </div>
                  )}
                </div>

                {/* Cat ambassador */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-bold text-gray-500">🐱 猫アンバサダー</p>
                  {selectedPrefData.cat ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[#D4A843]/20 bg-[#D4A843]/5 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPrefData.cat.imageUrl}
                        alt={selectedPrefData.cat.petName}
                        className="h-12 w-12 rounded-full border-2 border-[#D4A843] object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold">{selectedPrefData.cat.name}</p>
                        <p className="text-xs text-gray-500">{selectedPrefData.cat.petName}</p>
                        <p className="text-[10px] text-emerald-600">
                          寄付 ¥{selectedPrefData.cat.donationTotal.toLocaleString()} /{" "}
                          {selectedPrefData.cat.postCount}投稿
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-400">空席</p>
                    </div>
                  )}
                </div>

                {(!selectedPrefData.dog || !selectedPrefData.cat) && (
                  <button
                    onClick={() => setSelectedPref(null)}
                    className="mb-2 w-full rounded-xl bg-gradient-to-r from-[#D4A843] to-[#B8860B] py-3 text-sm font-bold text-white shadow-lg shadow-amber-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    この地域のアンバサダーに挑戦する
                  </button>
                )}
                <button
                  onClick={() => setSelectedPref(null)}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
                >
                  閉じる
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ Section 4: Ambassador Benefits Detail ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <h2 className="mb-4 text-lg font-bold text-[#0D1B2A]">🎁 アンバサダー特典詳細</h2>

          {/* Frame previews */}
          <div className="mb-4 space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="mb-1 flex items-center gap-2">
                <AmbassadorBadge level={3} compact />
                <span className="text-xs font-bold text-amber-700">Lv.3 金フレーム</span>
              </div>
              <p className="text-[10px] text-amber-600">
                投稿写真に金色のフレームが表示されます。地域を代表するアンバサダーの証です。
              </p>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
              <div className="mb-1 flex items-center gap-2">
                <AmbassadorBadge level={4} compact />
                <span className="text-xs font-bold text-purple-700">Lv.4 ダイヤモンドフレーム</span>
              </div>
              <p className="text-[10px] text-purple-600">
                ダイヤモンドの輝きを持つ特別フレーム。YOLO運営との直通チャットアクセスも。
              </p>
            </div>
            <div className="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 to-blue-50 p-3">
              <div className="mb-1 flex items-center gap-2">
                <AmbassadorBadge level={5} compact />
                <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-xs font-bold text-transparent">
                  Lv.5 レインボーフレーム
                </span>
              </div>
              <p className="text-[10px] text-gray-600">
                七色に輝くレジェンド専用フレーム。公式パートナーとして認定されます。
              </p>
            </div>
          </div>

          {/* How promotion works */}
          <div className="mb-3 rounded-xl bg-gray-50 p-4">
            <p className="mb-2 text-xs font-bold text-gray-700">📈 昇格の仕組み</p>
            <div className="space-y-2 text-xs text-gray-600">
              <p>1. 寄付タグ付き投稿を続けて実績を積む</p>
              <p>2. フォロワーを増やして影響力を高める</p>
              <p>3. 条件達成で自動的にランクアップ</p>
              <p>4. 地域枠は寄付貢献TOPが自動選出</p>
            </div>
          </div>

          {/* Donation multiplier explanation */}
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="mb-2 text-xs font-bold text-emerald-700">🌟 寄付倍率の仕組み</p>
            <p className="text-xs leading-relaxed text-emerald-600">
              アンバサダーの投稿は、通常の投稿よりも多くの寄付を生み出します。
              例えば2x倍率の場合、1投稿あたりの寄付貢献額が2倍になります。
              より高いランクを目指して、もっと多くの動物を救いましょう。
            </p>
          </div>
        </motion.div>

        {/* ═══════ Section 5: Legend Hall of Fame ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <h2 className="mb-3 text-lg font-bold text-[#0D1B2A]">🏆 Legend Hall of Fame</h2>

          {legendsLoading ? (
            <div className="flex gap-3 overflow-hidden pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 w-36 flex-shrink-0 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          ) : legends.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">まだレジェンドはいません</div>
          ) : (
            <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
              {legends.map((legend, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="rainbow-border w-36 flex-shrink-0 rounded-2xl bg-gradient-to-b from-white to-gray-50 p-3 text-center"
                >
                  <div className="relative mb-2 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={legend.imageUrl}
                      alt={legend.petName}
                      className="sparkle h-20 w-20 rounded-full border-3 border-[#D4A843] object-cover shadow-lg"
                    />
                    <motion.span
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="absolute -top-2 -right-2 text-xl"
                    >
                      {legend.badge}
                    </motion.span>
                  </div>
                  <p className="text-xs font-bold text-gray-900">{legend.name}</p>
                  <p className="text-[10px] text-gray-400">{legend.petName}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                    ¥{legend.totalDonation.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══════ Section 6: CTA ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 space-y-3"
        >
          {userLevel < 5 && (
            <div className="rounded-2xl bg-gradient-to-r from-[#D4A843] to-amber-400 p-5 text-center text-white shadow-lg shadow-amber-200">
              <p className="mb-1 text-lg font-bold">
                次の目標: {AMBASSADOR_RANKS[userLevel]?.emoji} {AMBASSADOR_RANKS[userLevel]?.name}
              </p>
              <p className="mb-3 text-xs opacity-80">
                寄付倍率が{AMBASSADOR_RANKS[userLevel]?.donationMultiplier}xにアップ！
              </p>
              <Link href="/subscription">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-[#D4A843] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                >
                  このランクを目指す
                </motion.button>
              </Link>
            </div>
          )}

          {user?.plan === "free" && (
            <Link href="/subscription">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-teal-400 p-5 text-center text-white shadow-lg shadow-[#2A9D8F]/20"
              >
                <p className="mb-2 text-lg">💎</p>
                <p className="text-base font-bold">プランに加入してアンバサダーを目指す</p>
                <p className="mt-1 text-xs opacity-80">有料プランでより高いランクに到達できます</p>
              </motion.div>
            </Link>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default function AmbassadorPage() {
  return (
    <AuthGate>
      <AmbassadorContent />
    </AuthGate>
  );
}
