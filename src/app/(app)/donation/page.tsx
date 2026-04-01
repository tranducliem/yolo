"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/features/auth/AuthGate";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";
import DonationBadge from "@/components/features/donation/DonationBadge";
import { useToast } from "@/components/ui/Toast";
import type { DonationTag, DonationReport } from "@/types";

type RankingTab = "monthly" | "total";

const rankingTabs: { id: RankingTab; label: string }[] = [
  { id: "monthly", label: "今月" },
  { id: "total", label: "累計" },
];

interface DonationSummary {
  totalDonated: number;
  animalsHelped: number;
  monthlyBreakdown: {
    month: string;
    fromSubscription: number;
    fromGoods: number;
    fromAdditional: number;
    total: number;
  }[];
  totals: { fromSubscription: number; fromGoods: number; fromAdditional: number };
  ambassadorMultiplier: number;
}

interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalDonated: number;
  ambassadorLevel: number;
}

interface NpoEntry {
  id: string;
  name: string;
  location: string;
  target: string;
  allocationPercent: number;
  totalDonated: number;
}

/* ── Pie Chart (CSS only) ── */
function DonationPieChart() {
  const segments = [
    { label: "会員費", pct: 60, color: "#2A9D8F" },
    { label: "グッズ", pct: 30, color: "#D4A843" },
    { label: "追加寄付", pct: 10, color: "#0D1B2A" },
  ];
  const stops = segments.reduce<string[]>((result, s, i) => {
    const start = segments.slice(0, i).reduce((sum, seg) => sum + seg.pct, 0);
    const end = start + s.pct;
    result.push(`${s.color} ${start}% ${end}%`);
    return result;
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div
        className="h-24 w-24 flex-shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      />
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-xs text-gray-600">
              {s.label} {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar Chart (CSS bars) ── */
function MonthlyBarChart({ data }: { data: { month: string; total: number }[] }) {
  const chartData = data.slice(0, 8).reverse();
  const maxVal = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {chartData.map((d) => {
        const height = Math.max(4, (d.total / maxVal) * 100);
        const month = d.month.split("-")[1];
        return (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[8px] text-gray-400">
              {d.total >= 10000 ? `¥${Math.round(d.total / 10000)}万` : `¥${d.total}`}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="w-full rounded-t-md bg-gradient-to-t from-[#2A9D8F] to-[#4ECDC4]"
            />
            <span className="text-[10px] text-gray-500">{month}月</span>
          </div>
        );
      })}
    </div>
  );
}

function DonationContent() {
  const { user } = useAuth();
  const toast = useToast();
  const [rankTab, setRankTab] = useState<RankingTab>("total");
  const [additionalModal, setAdditionalModal] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState(500);
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [npos, setNpos] = useState<NpoEntry[]>([]);
  const [donationTags, setDonationTags] = useState<DonationTag[]>([]);
  const [report, setReport] = useState<DonationReport | null>(null);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/donation/summary");
      if (res.ok) setSummary(await res.json());
    } catch {
      /* no fallback */
    }
  }, []);

  const fetchDonationTags = useCallback(async () => {
    try {
      const res = await fetch("/api/donation/tags");
      if (res.ok) {
        const data = await res.json();
        setDonationTags(data.tags || []);
      }
    } catch {
      /* no fallback */
    } finally {
      setTagsLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch("/api/donation/reports/latest");
      if (res.ok) {
        const data = await res.json();
        if (data.report) setReport(data.report);
      }
    } catch {
      /* no fallback */
    } finally {
      setReportLoading(false);
    }
  }, []);

  const fetchRankings = useCallback(async (period: string) => {
    try {
      const res = await fetch(`/api/donation/ranking?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
      }
    } catch {
      /* fallback empty */
    }
  }, []);

  const fetchNpos = useCallback(async () => {
    try {
      const res = await fetch("/api/donation/npos");
      if (res.ok) {
        const data = await res.json();
        setNpos(data.npos || []);
      }
    } catch {
      /* fallback empty */
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchNpos();
    fetchDonationTags();
    fetchReport();
  }, [fetchSummary, fetchNpos, fetchDonationTags, fetchReport]);

  useEffect(() => {
    fetchRankings(rankTab);
  }, [rankTab, fetchRankings]);

  const totalDonated = summary?.totalDonated ?? user?.donationTotal ?? 0;
  const animalsHelped = summary?.animalsHelped ?? Math.floor(totalDonated / 100);
  const totals = summary?.totals ?? { fromSubscription: 0, fromGoods: 0, fromAdditional: 0 };
  const communityTotal = npos.reduce((sum, n) => sum + n.totalDonated, 0);
  const communityAnimals = Math.floor(communityTotal / 100);

  const handleAdditionalDonate = async () => {
    toast.show("追加寄付機能は準備中です");
    setAdditionalModal(false);
  };

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-3xl font-bold text-[#0D1B2A]">🌟 寄付ダッシュボード</h1>
          <p className="mb-6 text-sm text-[#9CA3AF]">あなたの活動が命を救います</p>
        </motion.div>

        {/* ═══════ Section 1: Personal Donation Summary ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#0D1B2A] p-6 text-white shadow-lg shadow-[#2A9D8F]/20"
        >
          <p className="mb-2 text-sm opacity-80">あなたは</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-1 text-4xl font-extrabold tabular-nums"
          >
            {animalsHelped}匹
          </motion.p>
          <p className="mb-4 text-sm opacity-90">の命を救いました</p>

          <div className="mb-4 rounded-xl bg-white/15 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm opacity-80">寄付累計</span>
              <span className="text-3xl font-bold tabular-nums">
                ¥{totalDonated.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs opacity-80">
                <span>会員費から</span>
                <span>¥{totals.fromSubscription.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs opacity-80">
                <span>グッズ購入から</span>
                <span>¥{totals.fromGoods.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs opacity-80">
                <span>追加寄付</span>
                <span>¥{totals.fromAdditional.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setAdditionalModal(true)}
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-[#2A9D8F] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            🐾 追加で寄付する
          </motion.button>
        </motion.div>

        {/* ═══════ Section 2: Monthly Report ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="mb-3 text-base font-bold text-[#0D1B2A]">📋 今月の寄付レポート</h2>

          {reportLoading ? (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-28 w-28 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-28 w-28 animate-pulse rounded-xl bg-gray-200" />
              </div>
              <div className="h-12 animate-pulse rounded-xl bg-gray-200" />
            </div>
          ) : report ? (
            <>
              {report.npoName && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-3">
                  <p className="text-sm font-medium text-emerald-800">
                    今月の寄付先: {report.npoName}
                  </p>
                  {report.npoLocation && (
                    <p className="text-xs text-emerald-600">（{report.npoLocation}）</p>
                  )}
                </div>
              )}

              {(report.npos ?? []).length > 0 && (
                <div className="mb-4 space-y-2">
                  {(report.npos ?? []).map(
                    (npo: { name: string; totalDonated: number }, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl bg-emerald-50 p-3"
                      >
                        <span className="text-sm font-medium text-emerald-800">{npo.name}</span>
                        <span className="text-sm font-bold text-emerald-700">
                          ¥{npo.totalDonated.toLocaleString()}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

              {report.images && report.images.length > 0 && (
                <div className="hide-scrollbar mb-4 flex gap-2 overflow-x-auto">
                  {report.images.map((img: string, i: number) => (
                    <div key={i} className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`保護動物 ${i + 1}`}
                        className="h-28 w-28 rounded-xl object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-4 rounded-xl bg-teal-50 p-3">
                <p className="text-sm leading-relaxed text-teal-800">
                  あなたの寄付で今月
                  <span className="font-bold"> {report.animalsHelped ?? 0}匹</span>
                  の食事が届きました
                </p>
              </div>

              <p className="mb-2 text-xs font-bold text-gray-700">寄付金の使途</p>
              <DonationPieChart />
            </>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">まだレポートがありません</div>
          )}
        </motion.div>

        {/* ═══════ Section 3: Donation Rankings ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="mb-3 text-base font-bold text-[#0D1B2A]">🏆 寄付ランキング</h2>

          <div className="mb-4 flex gap-2">
            {rankingTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRankTab(tab.id)}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
                  rankTab === tab.id
                    ? "bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {rankings.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              まだランキングデータがありません
            </div>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {rankings.map((r, i) => (
                <motion.div
                  key={r.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:shadow-sm ${
                    r.rank === 1
                      ? "border border-amber-200 bg-amber-50"
                      : r.rank === 2
                        ? "border border-gray-200 bg-gray-50"
                        : r.rank === 3
                          ? "border border-orange-200 bg-orange-50"
                          : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-7 text-center text-sm font-bold ${
                      r.rank === 1
                        ? "text-yellow-500"
                        : r.rank === 2
                          ? "text-gray-400"
                          : r.rank === 3
                            ? "text-orange-400"
                            : "text-gray-400"
                    }`}
                  >
                    {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : `#${r.rank}`}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.avatarUrl || "/images/default-avatar.png"}
                    alt={r.displayName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-xs font-bold">{r.displayName}</p>
                      {r.ambassadorLevel > 0 && (
                        <AmbassadorBadge level={r.ambassadorLevel} compact />
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    ¥{r.totalDonated.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Own rank */}
          {user && totalDonated > 0 && (
            <div className="sticky bottom-0 mt-3 border-t border-gray-100 bg-white pt-3">
              <div className="flex items-center gap-3 rounded-xl border border-[#2A9D8F]/20 bg-[#2A9D8F]/10 p-2.5">
                <span className="w-7 text-center text-sm font-bold text-[#2A9D8F]">-</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-[#2A9D8F]">
                      {user.displayName || user.name || "あなた"}（あなた）
                    </p>
                    <AmbassadorBadge level={user.ambassadorLevel ?? 0} compact />
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  ¥{totalDonated.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ═══════ Section 4: Active Donation Tags ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="mb-3 text-base font-bold text-[#0D1B2A]">🏷️ 寄付タグ</h2>

          {tagsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : donationTags.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">まだ寄付タグがありません</div>
          ) : (
            <div className="space-y-3">
              {donationTags.map((tag) => (
                <div
                  key={tag.id}
                  className={`rounded-xl border p-3 ${
                    tag.isSponsor
                      ? "border-dashed border-[#D4A843] bg-amber-50/50"
                      : tag.isActive
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{tag.tag}</span>
                      {tag.isSponsor && (
                        <span className="rounded-full bg-[#D4A843]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#D4A843]">
                          Coming Soon
                        </span>
                      )}
                      {tag.isActive && <DonationBadge compact />}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{tag.posts}件の投稿</span>
                    <span>寄付累計 ¥{tag.donationTotal.toLocaleString()}</span>
                  </div>
                  {tag.isActive && !tag.isSponsor && (
                    <Link
                      href="/post"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#2A9D8F] hover:underline"
                    >
                      📷 このタグで投稿する &rarr;
                    </Link>
                  )}
                  {tag.isSponsor && (
                    <p className="mt-1 text-[10px] text-[#D4A843]">
                      {tag.sponsorName}がスポンサーするタグです（準備中）
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══════ Section 5: Community Total ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="mb-4 text-base font-bold text-[#0D1B2A]">🌍 コミュニティの力</h2>

          <div className="mb-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-center">
            <p className="mb-1 text-sm text-emerald-700">YOLOコミュニティは合計</p>
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-3xl font-bold text-emerald-800 tabular-nums"
            >
              {communityAnimals > 0 ? communityAnimals.toLocaleString() : "0"}匹
            </motion.p>
            <p className="mt-1 text-sm text-emerald-700">の命を救いました</p>
            <p className="mt-2 text-lg font-bold text-emerald-600">
              寄付総額: ¥{communityTotal.toLocaleString()}
            </p>
          </div>

          {/* NPO list */}
          <p className="mb-2 text-xs font-bold text-gray-700">パートナーNPO</p>
          <div className="mb-4 space-y-2">
            {npos.map((npo) => (
              <div key={npo.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5">
                <span className="text-lg">
                  {npo.target === "dog" ? "🐶" : npo.target === "cat" ? "🐱" : "🐾"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{npo.name}</p>
                  <p className="text-[10px] text-gray-400">{npo.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600">
                    ¥{npo.totalDonated.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">{npo.allocationPercent}%配分</p>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly bar chart */}
          <p className="mb-3 text-xs font-bold text-gray-700">月別寄付推移</p>
          {summary?.monthlyBreakdown && summary.monthlyBreakdown.length > 0 ? (
            <MonthlyBarChart data={summary.monthlyBreakdown} />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              まだデータがありません
            </div>
          )}
        </motion.div>

        {/* ═══════ Section 6: CTA ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <Link href="/ambassador">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer rounded-2xl bg-gradient-to-r from-[#D4A843] to-amber-400 p-5 text-center text-white shadow-lg shadow-amber-200"
            >
              <p className="mb-2 text-2xl">👑</p>
              <p className="text-base font-bold">アンバサダーになってもっと救おう</p>
              <p className="mt-1 text-xs opacity-80">寄付倍率UP・限定バッジ・地域代表として活動</p>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Additional donation modal */}
      {additionalModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={() => setAdditionalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 text-center">
              <p className="mb-2 text-3xl">🌟</p>
              <h3 className="text-lg font-bold">追加寄付</h3>
              <p className="mt-1 text-sm text-gray-500">今月さらに保護施設に寄付します</p>
            </div>

            <div className="mb-4 flex gap-2">
              {[100, 500, 1000, 3000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAdditionalAmount(amt)}
                  className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all duration-200 ${
                    additionalAmount === amt
                      ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  ¥{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-xs text-emerald-600">寄付金額</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                ¥{additionalAmount.toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleAdditionalDonate}
              className="mb-3 w-full rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              寄付する
            </button>
            <button
              onClick={() => setAdditionalModal(false)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
            >
              キャンセル
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

export default function DonationPage() {
  return (
    <AuthGate>
      <DonationContent />
    </AuthGate>
  );
}
