"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockSponsors, mockNPOs, mockPosts } from "@/lib/mockData";

const sponsorStatusColor: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  scheduled: "bg-blue-50 text-blue-600",
  ended: "bg-gray-100 text-gray-500",
  draft: "bg-yellow-50 text-yellow-600",
};

const sponsorStatusLabel: Record<string, string> = {
  active: "🟢 稼働中",
  scheduled: "🔵 予定",
  ended: "⚪ 終了",
  draft: "🟡 下書き",
};

export default function SponsorsAdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(mockSponsors[0]?.id || "");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [autoSelectMode, setAutoSelectMode] = useState(false);
  const [autoSelectCount, setAutoSelectCount] = useState("10");

  // Form state
  const [formCompany, setFormCompany] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formAge, setFormAge] = useState("all");
  const [formGender, setFormGender] = useState("all");
  const [formPetType, setFormPetType] = useState("all");
  const [formRegion, setFormRegion] = useState("all");
  const [formAllocated, setFormAllocated] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formNpo, setFormNpo] = useState(mockNPOs[0]?.id || "");

  // Mock collected images from posts
  const sponsorImages = mockPosts.slice(0, 12).map((p) => p.imageUrl);

  const toggleImage = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const currentSponsor = mockSponsors.find((s) => s.id === selectedSponsor);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#0D1B2A] mb-6">
        🏷️ スポンサー管理
      </h1>

      {/* Phase 2 banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 flex items-center gap-3"
      >
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-yellow-800">
            Phase2（M7〜）で本格稼働。現在はUI準備中
          </p>
          <p className="text-xs text-yellow-600 mt-0.5">
            スポンサー機能は現在モックデータで動作しています。本番データ連携はPhase2で実装予定です。
          </p>
        </div>
      </motion.div>

      {/* Section 1: Sponsor List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            📋 スポンサー一覧
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2A9D8F] text-white text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200"
          >
            スポンサーを追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D1B2A] text-white">
                <th className="text-left py-3 px-2 font-medium rounded-tl-lg">
                  企業名
                </th>
                <th className="text-right py-3 px-2 font-medium">
                  予算
                </th>
                <th className="text-left py-3 px-2 font-medium">
                  タグ
                </th>
                <th className="text-left py-3 px-2 font-medium">
                  対象
                </th>
                <th className="text-left py-3 px-2 font-medium">
                  期間
                </th>
                <th className="text-center py-3 px-2 font-medium rounded-tr-lg">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody>
              {mockSponsors.map((sponsor, sponsorIdx) => (
                <tr
                  key={sponsor.id}
                  className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${sponsorIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {sponsor.companyName}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    ¥{sponsor.budget.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-[#2A9D8F] text-xs">
                    {sponsor.tag}
                  </td>
                  <td className="py-3 px-2 text-gray-600 text-xs">
                    {sponsor.targetPetType === "both"
                      ? "犬猫"
                      : sponsor.targetPetType === "dog"
                        ? "犬"
                        : "猫"}
                    {sponsor.targetRegion
                      ? ` / ${sponsor.targetRegion}`
                      : ""}
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs">
                    {sponsor.startDate} 〜 {sponsor.endDate}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${sponsorStatusColor[sponsor.status]}`}
                    >
                      {sponsorStatusLabel[sponsor.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Section 2: Sponsor Registration Form (HUNTERS patent flow) */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-5">
            📝 スポンサー登録フォーム
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                企業名
              </label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="企業名を入力..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                連絡先
              </label>
              <input
                type="text"
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                placeholder="メールアドレスまたは電話番号"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                予算総額
              </label>
              <input
                type="number"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                placeholder="¥"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                希望タグ
              </label>
              <input
                type="text"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="#企業名YOLO..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>

            {/* Target attributes */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                投稿者年齢
              </label>
              <select
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              >
                <option value="all">すべて</option>
                <option value="18-24">18〜24歳</option>
                <option value="25-34">25〜34歳</option>
                <option value="35-44">35〜44歳</option>
                <option value="45-54">45〜54歳</option>
                <option value="55+">55歳以上</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                投稿者性別
              </label>
              <select
                value={formGender}
                onChange={(e) => setFormGender(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              >
                <option value="all">すべて</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                ペット種別
              </label>
              <select
                value={formPetType}
                onChange={(e) => setFormPetType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              >
                <option value="all">すべて</option>
                <option value="dog">犬</option>
                <option value="cat">猫</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                地域
              </label>
              <select
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              >
                <option value="all">全国</option>
                <option value="hokkaido">北海道</option>
                <option value="tohoku">東北</option>
                <option value="kanto">関東</option>
                <option value="chubu">中部</option>
                <option value="kinki">近畿</option>
                <option value="chugoku">中国</option>
                <option value="shikoku">四国</option>
                <option value="kyushu">九州</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                予算割当額
              </label>
              <input
                type="number"
                value={formAllocated}
                onChange={(e) => setFormAllocated(e.target.value)}
                placeholder="¥"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                寄付先NPO
              </label>
              <select
                value={formNpo}
                onChange={(e) => setFormNpo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              >
                {mockNPOs.map((npo) => (
                  <option key={npo.id} value={npo.id}>
                    {npo.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
          </div>
          <button className="mt-6 bg-[#2A9D8F] text-white py-3 px-8 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200">
            設定を保存
          </button>
        </motion.div>
      )}

      {/* Section 3: Sponsor Image Selection (HUNTERS patent image identification) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          📸 スポンサー画像選定
        </h3>

        {/* Sponsor selector */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              スポンサー選択
            </label>
            <select
              value={selectedSponsor}
              onChange={(e) => {
                setSelectedSponsor(e.target.value);
                setSelectedImages([]);
              }}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
            >
              {mockSponsors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-selection toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-500">
                AIスコアTOP N枚を自動選定
              </span>
              <button
                onClick={() => setAutoSelectMode(!autoSelectMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  autoSelectMode ? "bg-[#2A9D8F]" : "bg-gray-300"
                }`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
                  animate={{ x: autoSelectMode ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </label>
            {autoSelectMode && (
              <input
                type="number"
                value={autoSelectCount}
                onChange={(e) => setAutoSelectCount(e.target.value)}
                className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
                min={1}
                max={50}
              />
            )}
          </div>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
          {sponsorImages.map((url, i) => {
            const isSelected = selectedImages.includes(url);
            return (
              <motion.div
                key={`${url}-${i}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleImage(url)}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${
                  isSelected
                    ? "border-[#2A9D8F] ring-2 ring-[#2A9D8F]/30"
                    : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`候補画像${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#2A9D8F]/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#2A9D8F] flex items-center justify-center">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 7L6 10L11 4"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                {autoSelectMode && i < Number(autoSelectCount) && (
                  <div className="absolute top-1 left-1 bg-yellow-400 text-[10px] text-gray-900 font-bold px-1.5 py-0.5 rounded-full">
                    AI #{i + 1}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {selectedImages.length}枚選択中
          </p>
          <button
            disabled={selectedImages.length === 0}
            className="bg-[#2A9D8F] text-white text-sm px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            この画像を寄付と関連付ける
          </button>
        </div>

        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-200"
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{selectedImages.length}枚</span>{" "}
              の画像を{currentSponsor?.companyName || "スポンサー"}{" "}
              の寄付に関連付けます。
            </p>
            <p className="text-xs text-gray-500 mt-1">
              寄付額: ¥
              {(
                (currentSponsor?.budgetAllocated || 50000) / 100
              ).toLocaleString()}{" "}
              /枚 × {selectedImages.length}枚 = ¥
              {(
                ((currentSponsor?.budgetAllocated || 50000) / 100) *
                selectedImages.length
              ).toLocaleString()}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Section 4: Sponsor Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            📊 スポンサーレポート
          </h3>
          <button className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200">
            PDFエクスポート
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockSponsors.map((sponsor) => {
            const npo = mockNPOs.find((n) => n.id === sponsor.npoId);
            return (
              <div
                key={sponsor.id}
                className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {sponsor.companyName}
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${sponsorStatusColor[sponsor.status]}`}
                  >
                    {sponsorStatusLabel[sponsor.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">投稿数</p>
                    <p className="text-lg font-bold tabular-nums text-[#0D1B2A]">
                      {sponsor.postCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">インプレッション</p>
                    <p className="text-lg font-bold tabular-nums text-[#0D1B2A]">
                      {sponsor.impressions.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">寄付額</p>
                    <p className="text-lg font-bold text-[#2A9D8F]">
                      ¥{sponsor.donationTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">寄付先NPO</p>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {npo?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>タグ: {sponsor.tag}</span>
                  <span>予算: ¥{sponsor.budget.toLocaleString()}</span>
                </div>
                {/* Mini engagement bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>予算消化率</span>
                    <span>
                      {Math.round(
                        (sponsor.donationTotal / sponsor.budget) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#2A9D8F] h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((sponsor.donationTotal / sponsor.budget) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
