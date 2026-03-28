"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  mockDonationTags,
  mockNPOs,
  mockDonationMonthly,
  mockDonationReport,
  mockDonationRankings,
  mockPersonalDonation,
} from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import AuthGate from "@/components/AuthGate";
import AmbassadorBadge from "@/components/AmbassadorBadge";
import DonationBadge from "@/components/DonationBadge";

type RankingTab = "monthly" | "total" | "region";

const rankingTabs: { id: RankingTab; label: string }[] = [
  { id: "monthly", label: "今月" },
  { id: "total", label: "累計" },
  { id: "region", label: "地域別" },
];

/* ── Pie Chart (CSS only) ── */
function DonationPieChart() {
  const segments = [
    { label: "食事", pct: 60, color: "#2A9D8F" },
    { label: "医療", pct: 30, color: "#D4A843" },
    { label: "施設", pct: 10, color: "#0D1B2A" },
  ];
  // conic-gradient
  let acc = 0;
  const stops = segments.map((s) => {
    const start = acc;
    acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  });

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-24 h-24 rounded-full flex-shrink-0"
        style={{
          background: `conic-gradient(${stops.join(", ")})`,
        }}
      />
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-xs text-gray-600">{s.label} {s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar Chart (CSS bars) ── */
function MonthlyBarChart() {
  const data = mockDonationMonthly.slice(0, 8).reverse();
  const maxVal = Math.max(...data.map((d) => d.total));

  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => {
        const height = Math.max(4, (d.total / maxVal) * 100);
        const month = d.month.split("/")[1];
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[8px] text-gray-400">
              ¥{Math.round(d.total / 10000)}万
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
  const [rankTab, setRankTab] = useState<RankingTab>("monthly");
  const [additionalModal, setAdditionalModal] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState(500);

  const report = mockDonationReport;
  const personal = mockPersonalDonation[0];

  // Mock rankings for different tabs
  const rankingsData = mockDonationRankings;
  // Find user's own rank (mock)
  const myRank = { rank: 8, name: user?.name || "田中さくら", petName: user?.petName || "モカ", amount: 2340, ambassadorLevel: user?.ambassadorLevel || 3 };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 lg:pl-60">
      <SideNav />

      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-1">🌟 寄付ダッシュボード</h1>
          <p className="text-sm text-[#9CA3AF] mb-6">あなたの活動が命を救います</p>
        </motion.div>

        {/* ═══════ Section 1: Personal Donation Summary ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#2A9D8F] to-[#0D1B2A] rounded-2xl p-6 mb-6 text-white shadow-lg shadow-[#2A9D8F]/20"
        >
          <p className="text-sm opacity-80 mb-2">あなたは</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-4xl font-extrabold tabular-nums mb-1"
          >
            {user?.donationCount || 47}匹
          </motion.p>
          <p className="text-sm opacity-90 mb-4">の命を救いました</p>

          <div className="bg-white/15 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm opacity-80">寄付累計</span>
              <span className="text-3xl font-bold tabular-nums">
                ¥{(user?.donationTotal || 2340).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs opacity-80">
                <span>会員費から</span>
                <span>¥{personal.fromSubscription.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs opacity-80">
                <span>グッズ購入から</span>
                <span>¥{personal.fromGoods.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs opacity-80">
                <span>追加寄付</span>
                <span>¥{personal.fromAdditional.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setAdditionalModal(true)}
            className="w-full py-3 rounded-xl bg-white text-[#2A9D8F] font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            🐾 追加で寄付する
          </motion.button>
        </motion.div>

        {/* ═══════ Section 2: Monthly Report ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 mb-6"
        >
          <h2 className="text-base font-bold text-[#0D1B2A] mb-3">📋 今月の寄付レポート</h2>

          <div className="bg-emerald-50 rounded-xl p-3 mb-4">
            <p className="text-sm font-medium text-emerald-800">
              今月の寄付先: {report.npoName}
            </p>
            <p className="text-xs text-emerald-600">（{report.npoLocation}）</p>
          </div>

          {/* Before/After photos */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            {report.images.map((img, i) => (
              <div key={i} className="flex-shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`保護動物 ${i + 1}`}
                  className="w-28 h-28 rounded-xl object-cover"
                />
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                  {i === 0 ? "Before" : "After"}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-teal-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-teal-800 leading-relaxed">
              あなたの寄付で今月 犬<span className="font-bold">{report.dogCount}匹</span>・猫<span className="font-bold">{report.catCount}匹</span> の食事が届きました
            </p>
          </div>

          {/* Pie chart */}
          <p className="text-xs font-bold text-gray-700 mb-2">寄付金の使途</p>
          <DonationPieChart />
        </motion.div>

        {/* ═══════ Section 3: Donation Rankings ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 mb-6"
        >
          <h2 className="text-base font-bold text-[#0D1B2A] mb-3">🏆 寄付ランキング</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {rankingTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRankTab(tab.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  rankTab === tab.id
                    ? "bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Rankings list */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {rankingsData.slice(0, 20).map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:shadow-sm ${
                  r.rank === 1 ? "bg-amber-50 border border-amber-200" : r.rank === 2 ? "bg-gray-50 border border-gray-200" : r.rank === 3 ? "bg-orange-50 border border-orange-200" : "bg-gray-50"
                }`}
              >
                <span className={`w-7 text-center text-sm font-bold ${
                  r.rank === 1 ? "text-yellow-500" : r.rank === 2 ? "text-gray-400" : r.rank === 3 ? "text-orange-400" : "text-gray-400"
                }`}>
                  {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : `#${r.rank}`}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.imageUrl}
                  alt={r.petName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold truncate">{r.name}</p>
                    {r.ambassadorLevel > 0 && (
                      <AmbassadorBadge level={r.ambassadorLevel} compact />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">{r.petName}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  ¥{r.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Fixed own rank */}
          <div className="sticky bottom-0 mt-3 pt-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#2A9D8F]/10 border border-[#2A9D8F]/20">
              <span className="w-7 text-center text-sm font-bold text-[#2A9D8F]">#{myRank.rank}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-[#2A9D8F]">{myRank.name}（あなた）</p>
                  <AmbassadorBadge level={myRank.ambassadorLevel} compact />
                </div>
                <p className="text-[10px] text-gray-400">{myRank.petName}</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                ¥{myRank.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══════ Section 4: Active Donation Tags ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 mb-6"
        >
          <h2 className="text-base font-bold text-[#0D1B2A] mb-3">🏷️ 寄付タグ</h2>

          <div className="space-y-3">
            {mockDonationTags.map((tag) => (
              <div
                key={tag.id}
                className={`rounded-xl p-3 border ${
                  tag.isSponsor
                    ? "border-dashed border-[#D4A843] bg-amber-50/50"
                    : tag.isActive
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{tag.tag}</span>
                    {tag.isSponsor && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#D4A843]/20 text-[#D4A843] font-bold rounded-full">
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
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#2A9D8F] hover:underline"
                  >
                    📷 このタグで投稿する &rarr;
                  </Link>
                )}
                {tag.isSponsor && (
                  <p className="text-[10px] text-[#D4A843] mt-1">
                    {tag.sponsorName}がスポンサーするタグです（準備中）
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══════ Section 5: Community Total ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 mb-6"
        >
          <h2 className="text-base font-bold text-[#0D1B2A] mb-4">🌍 コミュニティの力</h2>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 text-center border border-emerald-200">
            <p className="text-sm text-emerald-700 mb-1">YOLOコミュニティは合計</p>
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-3xl font-bold tabular-nums text-emerald-800"
            >
              12,847匹
            </motion.p>
            <p className="text-sm text-emerald-700 mt-1">の命を救いました</p>
            <p className="text-lg font-bold text-emerald-600 mt-2">
              寄付総額: ¥12,847,000
            </p>
          </div>

          {/* NPO list */}
          <p className="text-xs font-bold text-gray-700 mb-2">パートナーNPO</p>
          <div className="space-y-2 mb-4">
            {mockNPOs.map((npo) => (
              <div key={npo.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <span className="text-lg">
                  {npo.target === "dog" ? "🐶" : npo.target === "cat" ? "🐱" : "🐾"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{npo.name}</p>
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
          <p className="text-xs font-bold text-gray-700 mb-3">月別寄付推移</p>
          <MonthlyBarChart />
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
              className="bg-gradient-to-r from-[#D4A843] to-amber-400 rounded-2xl p-5 text-white text-center shadow-lg shadow-amber-200 cursor-pointer"
            >
              <p className="text-2xl mb-2">👑</p>
              <p className="text-base font-bold">アンバサダーになってもっと救おう</p>
              <p className="text-xs opacity-80 mt-1">
                寄付倍率UP・限定バッジ・地域代表として活動
              </p>
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
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="text-center mb-4">
              <p className="text-3xl mb-2">🌟</p>
              <h3 className="text-lg font-bold">追加寄付</h3>
              <p className="text-sm text-gray-500 mt-1">
                今月さらに保護施設に寄付します
              </p>
            </div>

            <div className="flex gap-2 mb-4">
              {[100, 500, 1000, 3000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAdditionalAmount(amt)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    additionalAmount === amt
                      ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  ¥{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-emerald-600">寄付金額</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                ¥{additionalAmount.toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => setAdditionalModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] text-white font-bold text-sm shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-3"
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

      <BottomNav />
    </div>
  );
}

export default function DonationPage() {
  return (
    <AuthGate>
      <DonationContent />
    </AuthGate>
  );
}
