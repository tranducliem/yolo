"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockAdminUsers, ambassadorRanks, type MockAdminUser } from "@/lib/mockData";

const planLabel: Record<MockAdminUser["plan"], string> = {
  free: "Free",
  plus: "YOLO+",
  pro: "PRO",
  family: "FAMILY",
};

const planColor: Record<MockAdminUser["plan"], string> = {
  free: "bg-gray-100 text-gray-600",
  plus: "bg-blue-50 text-blue-600",
  pro: "bg-purple-50 text-purple-600",
  family: "bg-yellow-50 text-yellow-700",
};

const ambassadorBadge = (level: number) => {
  const rank = ambassadorRanks.find((r) => r.level === level);
  if (!rank || level === 0) return null;
  const bgColors: Record<number, string> = {
    1: "bg-green-50 text-green-700 border-green-200",
    2: "bg-blue-50 text-blue-700 border-blue-200",
    3: "bg-yellow-50 text-yellow-700 border-yellow-200",
    4: "bg-purple-50 text-purple-700 border-purple-200",
    5: "bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${bgColors[level] || ""}`}>
      {rank.emoji} Lv{level}
    </span>
  );
};

export default function UsersAdminPage() {
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterPetType, setFilterPetType] = useState<string>("all");
  const [filterAmbassador, setFilterAmbassador] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<MockAdminUser | null>(null);

  const filtered = mockAdminUsers.filter((u) => {
    if (filterPlan !== "all" && u.plan !== filterPlan) return false;
    if (filterPetType !== "all") {
      const match = u.pets.some((p) => p.species === filterPetType);
      if (!match) return false;
    }
    if (filterAmbassador !== "all") {
      if (filterAmbassador === "0" && u.ambassadorLevel !== 0) return false;
      if (filterAmbassador !== "0" && u.ambassadorLevel !== Number(filterAmbassador)) return false;
    }
    return true;
  });

  const totalUsers = 82345;
  const newThisMonth = 3456;
  const activeRate = 42;
  const avgArpu = 3280;

  const kpis = [
    { icon: "👥", label: "総ユーザー", value: totalUsers.toLocaleString() },
    { icon: "🆕", label: "今月新規", value: newThisMonth.toLocaleString() },
    { icon: "📊", label: "アクティブ率", value: `${activeRate}%` },
    { icon: "💰", label: "平均ARPU", value: `¥${avgArpu.toLocaleString()}` },
  ];

  // Ambassador level distribution
  const ambassadorDistribution = ambassadorRanks.map((rank) => ({
    ...rank,
    count: mockAdminUsers.filter((u) => u.ambassadorLevel === rank.level).length,
  }));
  const noAmbassadorCount = mockAdminUsers.filter((u) => u.ambassadorLevel === 0).length;

  // Mock billing history
  const mockBilling = [
    { date: "2026-03-01", amount: 1480, plan: "PRO" },
    { date: "2026-02-01", amount: 1480, plan: "PRO" },
    { date: "2026-01-01", amount: 480, plan: "YOLO+" },
  ];

  return (
    <div className="p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#0D1B2A] mb-6"
      >
        ユーザー管理
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-sm text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Ambassador Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-4">🌟 アンバサダー分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">未取得</p>
            <p className="text-xl font-bold tabular-nums text-gray-700">{noAmbassadorCount}</p>
            <p className="text-[10px] text-gray-400">人</p>
          </div>
          {ambassadorDistribution.map((rank) => (
            <div
              key={rank.level}
              className="bg-gradient-to-b from-[#2A9D8F]/5 to-white rounded-xl p-3 text-center border border-[#2A9D8F]/10"
            >
              <p className="text-xs text-gray-500 mb-1">
                {rank.emoji} Lv{rank.level}
              </p>
              <p className="text-xl font-bold tabular-nums text-[#0D1B2A]">{rank.count}</p>
              <p className="text-[10px] text-gray-400">{rank.name}</p>
            </div>
          ))}
        </div>
        {/* Mini bar chart */}
        <div className="mt-4 flex items-end gap-1 h-12">
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gray-300 rounded-t-sm"
              style={{ height: `${Math.max(4, (noAmbassadorCount / mockAdminUsers.length) * 100)}%` }}
            />
            <span className="text-[9px] text-gray-400 mt-1">-</span>
          </div>
          {ambassadorDistribution.map((rank) => (
            <div key={rank.level} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${Math.max(4, (rank.count / mockAdminUsers.length) * 100)}%`,
                  backgroundColor: "#2A9D8F",
                  opacity: 0.4 + rank.level * 0.12,
                }}
              />
              <span className="text-[9px] text-gray-400 mt-1">L{rank.level}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
      >
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">プラン</label>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
            >
              <option value="all">すべて</option>
              <option value="free">Free</option>
              <option value="plus">YOLO+</option>
              <option value="pro">PRO</option>
              <option value="family">FAMILY</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">ペット種別</label>
            <select
              value={filterPetType}
              onChange={(e) => setFilterPetType(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
            >
              <option value="all">すべて</option>
              <option value="dog">犬</option>
              <option value="cat">猫</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">アンバサダー</label>
            <select
              value={filterAmbassador}
              onChange={(e) => setFilterAmbassador(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
            >
              <option value="all">すべて</option>
              <option value="0">未取得</option>
              {ambassadorRanks.map((r) => (
                <option key={r.level} value={String(r.level)}>
                  {r.emoji} Lv{r.level} {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">期間</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
              <span className="self-center text-gray-400">〜</span>
              <input
                type="date"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D1B2A] text-white">
                <th className="text-left py-3 px-2 font-medium rounded-tl-lg">ID</th>
                <th className="text-left py-3 px-2 font-medium">名前</th>
                <th className="text-left py-3 px-2 font-medium">メール</th>
                <th className="text-center py-3 px-2 font-medium">プラン</th>
                <th className="text-center py-3 px-2 font-medium">アンバサダー</th>
                <th className="text-right py-3 px-2 font-medium">寄付累計</th>
                <th className="text-right py-3 px-2 font-medium">ARPU</th>
                <th className="text-left py-3 px-2 font-medium rounded-tr-lg">最終ログイン</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, userIdx) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer ${userIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="py-3 px-2 text-gray-400 font-mono text-xs">{user.id}</td>
                  <td className="py-3 px-2 font-medium text-gray-900">{user.name}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{user.email}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColor[user.plan]}`}>
                      {planLabel[user.plan]}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {user.ambassadorLevel > 0 ? (
                      ambassadorBadge(user.ambassadorLevel)
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {user.donationTotal > 0 ? (
                      <span className="text-[#2A9D8F] font-medium">¥{user.donationTotal.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-900">¥{user.arpu.toLocaleString()}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{user.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* User Detail Slide Panel */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white h-full shadow-xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">ユーザー詳細</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">{selectedUser.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColor[selectedUser.plan]}`}>
                          {planLabel[selectedUser.plan]}
                        </span>
                        {selectedUser.ambassadorLevel > 0 && ambassadorBadge(selectedUser.ambassadorLevel)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      登録: {selectedUser.registeredAt} / 最終ログイン: {selectedUser.lastLogin}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">投稿数</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUser.postCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">いいね</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUser.likeCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Crown</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUser.crownCount}</p>
                    </div>
                  </div>

                  {/* Donation / Ambassador Detail */}
                  <div className="bg-[#2A9D8F]/5 rounded-xl p-4 border border-[#2A9D8F]/20">
                    <h4 className="text-xs text-[#2A9D8F] font-semibold mb-3">寄付・アンバサダー情報</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">寄付累計額</p>
                        <p className="text-lg font-bold text-[#0D1B2A]">
                          ¥{selectedUser.donationTotal.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">アンバサダーLv</p>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedUser.ambassadorLevel > 0 ? (
                            <>
                              {ambassadorBadge(selectedUser.ambassadorLevel)}
                              <span className="text-sm text-gray-700">
                                {ambassadorRanks.find((r) => r.level === selectedUser.ambassadorLevel)?.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">未取得</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedUser.ambassadorLevel > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#2A9D8F]/10">
                        <p className="text-xs text-gray-500 mb-1">寄付倍率</p>
                        <p className="text-sm font-semibold text-[#2A9D8F]">
                          x{ambassadorRanks.find((r) => r.level === selectedUser.ambassadorLevel)?.donationMultiplier}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pets */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-2">ペット一覧</p>
                    {selectedUser.pets.map((pet, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{pet.species === "dog" ? "🐶" : "🐱"}</span>
                        <span className="text-sm text-gray-700">
                          {pet.name}（{pet.breed}）
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Billing History */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-2">課金履歴</p>
                    {mockBilling.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-xs text-gray-600">{b.date}</span>
                        <span className="text-xs text-gray-500">{b.plan}</span>
                        <span className="text-xs font-medium text-gray-900">¥{b.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">管理者メモ</label>
                    <textarea
                      placeholder="メモを入力..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#2A9D8F] text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200">
                      保存
                    </button>
                    <button className="bg-red-50 text-red-600 py-3 px-6 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all duration-200">
                      アカウント停止
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
