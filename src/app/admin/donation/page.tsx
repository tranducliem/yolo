"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  mockDonationTags,
  mockNPOs,
  mockDonationPool,
  mockDonationExecutions,
  mockDonationReport,
  mockDonationMonthly,
} from "@/lib/mockData";

const executionStatusColor: Record<string, string> = {
  completed: "bg-green-50 text-green-600",
  scheduled: "bg-blue-50 text-blue-600",
  pending: "bg-yellow-50 text-yellow-600",
};

const executionStatusLabel: Record<string, string> = {
  completed: "実施済み",
  scheduled: "予定",
  pending: "保留",
};

const targetLabel: Record<string, string> = {
  dog: "🐶 犬",
  cat: "🐱 猫",
  both: "🐾 犬猫両方",
};

export default function DonationAdminPage() {
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagLabel, setNewTagLabel] = useState("");
  const [reportText, setReportText] = useState(mockDonationReport.text);

  const kpis = [
    { icon: "💰", label: "今月寄付総額", value: "¥523,400" },
    { icon: "👥", label: "寄付者数", value: "12,847" },
    { icon: "📊", label: "平均寄付額", value: "¥41" },
    {
      icon: "📈",
      label: "前月比",
      value: "+15.2%",
      positive: true,
    },
  ];

  // Monthly chart data (last 6 months)
  const recentMonthly = mockDonationMonthly.slice(0, 6).reverse();
  const maxMonthly = Math.max(...recentMonthly.map((m) => m.total));

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#0D1B2A] mb-6">
        🌟 寄付管理
      </h1>

      {/* Section 1: KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-sm text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">
              {kpi.value}
              {"positive" in kpi && (
                <span className="text-sm text-emerald-600 ml-2 inline-flex items-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                  </svg>
                </span>
              )}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Section 2: Donation Pool Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm border border-emerald-200 mb-8"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          💰 寄付プール残高
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 border border-emerald-100">
            <p className="text-xs text-gray-500 mb-1">会員費</p>
            <p className="text-lg font-bold tabular-nums text-emerald-700">
              ¥{mockDonationPool.fromSubscription.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-100">
            <p className="text-xs text-gray-500 mb-1">グッズ</p>
            <p className="text-lg font-bold tabular-nums text-emerald-700">
              ¥{mockDonationPool.fromGoods.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-100">
            <p className="text-xs text-gray-500 mb-1">追加寄付</p>
            <p className="text-lg font-bold tabular-nums text-emerald-700">
              ¥{mockDonationPool.fromAdditional.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 opacity-50">
            <p className="text-xs text-gray-400 mb-1">
              スポンサー(Phase2)
            </p>
            <p className="text-lg font-bold text-gray-400">
              ¥{mockDonationPool.fromSponsor.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#2A9D8F] rounded-xl p-4 text-white">
            <p className="text-xs text-white/80 mb-1">合計</p>
            <p className="text-lg font-bold tabular-nums">
              ¥{mockDonationPool.total.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">前回実施日:</span>
            <span className="font-medium">
              {mockDonationPool.lastExecutionDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">次回実施予定:</span>
            <span className="font-medium text-[#2A9D8F]">
              {mockDonationPool.nextExecutionDate}
            </span>
          </div>
        </div>

        {/* Monthly donation breakdown chart */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-gray-600 mb-3">
            月別寄付推移（6ヶ月）
          </h4>
          <div className="space-y-2">
            {recentMonthly.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">{m.month}</span>
                <div className="flex-1 flex h-5 rounded-sm overflow-hidden">
                  <div
                    className="bg-[#2A9D8F]"
                    style={{
                      width: `${(m.fromSubscription / maxMonthly) * 100}%`,
                    }}
                    title={`会員費 ¥${m.fromSubscription.toLocaleString()}`}
                  />
                  <div
                    className="bg-emerald-400"
                    style={{
                      width: `${(m.fromGoods / maxMonthly) * 100}%`,
                    }}
                    title={`グッズ ¥${m.fromGoods.toLocaleString()}`}
                  />
                  <div
                    className="bg-teal-300"
                    style={{
                      width: `${(m.fromAdditional / maxMonthly) * 100}%`,
                    }}
                    title={`追加 ¥${m.fromAdditional.toLocaleString()}`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-24 text-right">
                  ¥{m.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#2A9D8F]" />
              <span className="text-[10px] text-gray-500">会員費</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
              <span className="text-[10px] text-gray-500">グッズ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-teal-300" />
              <span className="text-[10px] text-gray-500">追加寄付</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: NPO Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            🏥 NPO管理
          </h3>
          <button className="bg-[#2A9D8F] text-white text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200">
            NPOを追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D1B2A] text-white">
                <th className="text-left py-3 px-2 font-medium rounded-tl-lg">
                  NPO名
                </th>
                <th className="text-left py-3 px-2 font-medium">
                  所在地
                </th>
                <th className="text-center py-3 px-2 font-medium">
                  対象
                </th>
                <th className="text-center py-3 px-2 font-medium">
                  配分率
                </th>
                <th className="text-right py-3 px-2 font-medium rounded-tr-lg">
                  累計寄付額
                </th>
              </tr>
            </thead>
            <tbody>
              {mockNPOs.map((npo, npoIdx) => (
                <tr
                  key={npo.id}
                  className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${npoIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {npo.name}
                  </td>
                  <td className="py-3 px-2 text-gray-600">{npo.location}</td>
                  <td className="py-3 px-2 text-center">
                    {targetLabel[npo.target]}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-24 bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-[#2A9D8F] h-3 rounded-full transition-all"
                          style={{ width: `${npo.allocationPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-8">
                        {npo.allocationPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-medium tabular-nums text-emerald-700">
                    ¥{npo.totalDonated.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-400">配分率合計:</span>
          <span className="text-xs font-bold text-[#2A9D8F]">
            {mockNPOs.reduce((s, n) => s + n.allocationPercent, 0)}%
          </span>
        </div>
      </motion.div>

      {/* Section 4: Monthly Report Creation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            📋 月次レポート作成
          </h3>
          <button
            onClick={() => setShowReportPreview(!showReportPreview)}
            className="bg-[#2A9D8F] text-white text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200"
          >
            {showReportPreview
              ? "プレビューを閉じる"
              : "今月のレポートを作成"}
          </button>
        </div>

        {showReportPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌟</span>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {mockDonationReport.month} 寄付レポート
                  </h4>
                  <p className="text-xs text-gray-500">
                    {mockDonationReport.npoName}（{mockDonationReport.npoLocation}）
                  </p>
                </div>
              </div>

              {/* Photo upload area */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {mockDonationReport.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`レポート画像${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <p className="text-xs text-gray-400">🐶 保護犬</p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockDonationReport.dogCount}匹
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <p className="text-xs text-gray-400">🐱 保護猫</p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockDonationReport.catCount}匹
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <p className="text-xs text-gray-400">💰 寄付額</p>
                  <p className="text-xl font-bold text-[#2A9D8F]">
                    ¥{mockDonationReport.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">
                  レポート本文
                </label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">
                  写真をアップロード
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#2A9D8F] transition-colors cursor-pointer">
                  <p className="text-gray-400 text-sm">
                    📷 クリックまたはドラッグ&ドロップ
                  </p>
                </div>
              </div>

              <button className="w-full bg-[#2A9D8F] text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200">
                全ユーザーに配信
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
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            🏷️ 寄付タグ管理
          </h3>
          <button
            onClick={() => setShowNewTagForm(!showNewTagForm)}
            className="bg-[#2A9D8F] text-white text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200"
          >
            新しい寄付タグを作成
          </button>
        </div>

        {showNewTagForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    タグ名
                  </label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="#YOLO..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    ラベル
                  </label>
                  <input
                    type="text"
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    placeholder="表示名..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                  />
                </div>
              </div>
              <button className="bg-[#2A9D8F] text-white text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200">
                タグを作成
              </button>
            </div>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D1B2A] text-white">
                <th className="text-left py-3 px-2 font-medium rounded-tl-lg">
                  タグ
                </th>
                <th className="text-left py-3 px-2 font-medium">
                  ラベル
                </th>
                <th className="text-right py-3 px-2 font-medium">
                  投稿数
                </th>
                <th className="text-right py-3 px-2 font-medium">
                  寄付総額
                </th>
                <th className="text-center py-3 px-2 font-medium rounded-tr-lg">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody>
              {mockDonationTags.map((tag, tagIdx) => (
                <tr
                  key={tag.id}
                  className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${tagIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="py-3 px-2 font-medium text-[#2A9D8F]">
                    {tag.tag}
                    {tag.isSponsor && (
                      <span className="ml-2 bg-yellow-50 text-yellow-600 text-[10px] px-1.5 py-0.5 rounded-full">
                        スポンサー
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-gray-600">{tag.label}</td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {tag.posts.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium tabular-nums text-emerald-700">
                    ¥{tag.donationTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tag.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tag.isActive ? "🟢 有効" : "⚪ 無効"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Section 6: Execution History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            📜 実行履歴
          </h3>
          <button className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            CSVエクスポート
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D1B2A] text-white">
                <th className="text-left py-3 px-2 font-medium rounded-tl-lg">
                  実施日
                </th>
                <th className="text-left py-3 px-2 font-medium">
                  NPO
                </th>
                <th className="text-right py-3 px-2 font-medium">
                  金額
                </th>
                <th className="text-center py-3 px-2 font-medium rounded-tr-lg">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody>
              {mockDonationExecutions.map((exec, i) => (
                <tr
                  key={`${exec.date}-${exec.npo}-${i}`}
                  className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="py-3 px-2 text-gray-700">{exec.date}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">
                    {exec.npo}
                  </td>
                  <td className="py-3 px-2 text-right font-medium tabular-nums text-emerald-700">
                    ¥{exec.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${executionStatusColor[exec.status]}`}
                    >
                      {executionStatusLabel[exec.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
