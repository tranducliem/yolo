"use client";

import { motion } from "framer-motion";
import { mockViralLoops, mockShareDistribution } from "@/lib/mockData";

export default function AnalyticsAdminPage() {
  const totalKFactor = mockViralLoops.reduce((sum, l) => sum + l.kFactor, 0);
  const maxKFactor = Math.max(...mockViralLoops.map((l) => l.kFactor));
  const targetKFactor = 2.0;
  const kFactorMet = totalKFactor >= targetKFactor;

  // SVG donut for share distribution
  const donutRadius = 70;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutSegments = mockShareDistribution.reduce<
    (typeof mockShareDistribution[number] & { offset: number; length: number })[]
  >((acc, s) => {
    const offset = acc.reduce((sum, seg) => sum + seg.length, 0);
    const segmentLength = (s.value / 100) * donutCircumference;
    acc.push({ ...s, offset, length: segmentLength });
    return acc;
  }, []);

  // Viral effect cards with funnel data
  const viralEffects = [
    {
      icon: "👑",
      label: "Crown効果",
      views: "45,200",
      shares: "3,400",
      newDLs: "1,250",
    },
    {
      icon: "⚔️",
      label: "Battle効果",
      views: "32,800",
      shares: "2,100",
      newDLs: "890",
    },
    {
      icon: "🎯",
      label: "Dare効果",
      views: "28,500",
      shares: "1,800",
      newDLs: "720",
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#0D1B2A] mb-6">
        📈 バイラル分析
      </h1>

      {/* K-Factor Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total K-Factor</p>
            <motion.p
              className={`text-5xl font-bold tabular-nums ${kFactorMet ? "text-emerald-600" : "text-amber-500"}`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {totalKFactor.toFixed(2)}
            </motion.p>
            <p className="text-sm text-gray-400 mt-1">
              目標 {targetKFactor.toFixed(1)}+{" "}
              {kFactorMet ? "✅" : "⚠️"}
            </p>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {mockViralLoops.length}バイラルループ別 K-Factor
            </h3>
            <div className="space-y-2">
              {mockViralLoops.map((loop, i) => (
                <div key={loop.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 truncate">
                    {loop.name}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                    <motion.div
                      className={`h-4 rounded-full ${
                        loop.kFactor >= 0.3
                          ? "bg-[#2A9D8F]"
                          : loop.kFactor >= 0.1
                            ? "bg-yellow-400"
                            : "bg-gray-300"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max(2, (loop.kFactor / maxKFactor) * 100)}%`,
                      }}
                      transition={{ delay: i * 0.03, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-700 w-10 text-right">
                    {loop.kFactor.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Share Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            シェア先分布
          </h3>
          <div className="flex items-center justify-center gap-8">
            <svg width="180" height="180" viewBox="0 0 180 180">
              {donutSegments.map((seg) => (
                <circle
                  key={seg.name}
                  cx="90"
                  cy="90"
                  r={donutRadius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="24"
                  strokeDasharray={`${seg.length} ${donutCircumference - seg.length}`}
                  strokeDashoffset={-seg.offset}
                  transform="rotate(-90 90 90)"
                />
              ))}
              <text
                x="90"
                y="85"
                textAnchor="middle"
                className="text-lg font-bold"
                fill="#1F2937"
              >
                シェア
              </text>
              <text
                x="90"
                y="105"
                textAnchor="middle"
                className="text-xs"
                fill="#9CA3AF"
              >
                分布
              </text>
            </svg>
            <div className="space-y-3">
              {mockShareDistribution.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm text-gray-700">{s.name}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {s.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Donation share analysis - NEW */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm border border-emerald-200"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            🌟 寄付バッジシェア分析
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 border border-emerald-100 text-center">
              <p className="text-xs text-gray-500 mb-1">
                寄付バッジ付きシェア
              </p>
              <p className="text-xs text-gray-400 mb-2">DL転換率</p>
              <p className="text-4xl font-bold tabular-nums text-[#2A9D8F]">18.5%</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M6 2L10 7H2L6 2Z" fill="#2A9D8F" />
                </svg>
                <span className="text-xs text-[#2A9D8F] font-bold">
                  +6.2pt
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">通常シェア</p>
              <p className="text-xs text-gray-400 mb-2">DL転換率</p>
              <p className="text-4xl font-bold tabular-nums text-gray-500">12.3%</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-xs text-gray-400">基準値</span>
              </div>
            </div>
          </div>
          {/* Visual comparison bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-24">寄付バッジ</span>
              <div className="flex-1 bg-white rounded-full h-6 border border-emerald-100 overflow-hidden">
                <motion.div
                  className="bg-[#2A9D8F] h-6 rounded-full flex items-center justify-end pr-2"
                  initial={{ width: 0 }}
                  animate={{ width: "92.5%" }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <span className="text-[10px] text-white font-bold">
                    18.5%
                  </span>
                </motion.div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-24">通常</span>
              <div className="flex-1 bg-white rounded-full h-6 border border-gray-200 overflow-hidden">
                <motion.div
                  className="bg-gray-400 h-6 rounded-full flex items-center justify-end pr-2"
                  initial={{ width: 0 }}
                  animate={{ width: "61.5%" }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                >
                  <span className="text-[10px] text-white font-bold">
                    12.3%
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            寄付バッジ付きシェアは通常シェアの
            <span className="font-bold text-[#2A9D8F]"> 1.5倍</span>
            のDL転換率を実現
          </p>
        </motion.div>
      </div>

      {/* Viral Effect Cards with funnel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {viralEffects.map((effect, idx) => (
          <motion.div
            key={effect.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{effect.icon}</span>
              <h3 className="text-sm font-semibold text-gray-700">
                {effect.label}
              </h3>
            </div>
            <div className="space-y-3">
              {/* Funnel: Views */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">👁 閲覧数</span>
                <span className="text-sm font-bold text-gray-900">
                  {effect.views}
                </span>
              </div>
              {/* Funnel arrow */}
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 3V13M8 13L4 9M8 13L12 9"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {/* Funnel: Shares */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">🔗 シェア数</span>
                <span className="text-sm font-bold text-gray-900">
                  {effect.shares}
                </span>
              </div>
              {/* Funnel arrow */}
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 3V13M8 13L4 9M8 13L12 9"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {/* Funnel: New DLs */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-500">📲 新規DL</span>
                <span className="text-sm font-bold text-emerald-600">
                  {effect.newDLs}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
