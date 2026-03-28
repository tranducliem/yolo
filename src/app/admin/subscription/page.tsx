"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockPlans } from "@/lib/mockData";

const planDist = [
  { name: "Free", pct: 68, color: "#9CA3AF" },
  { name: "YOLO+", pct: 18, color: "#3B82F6" },
  { name: "PRO", pct: 10, color: "#8B5CF6" },
  { name: "FAMILY", pct: 4, color: "#D4A843" },
];

const churnReasons = [
  { reason: "価格が高い", pct: 35 },
  { reason: "使わなくなった", pct: 25 },
  { reason: "機能不足", pct: 20 },
  { reason: "他サービス", pct: 12 },
  { reason: "その他", pct: 8 },
];

const monthlySubData = [
  { month: "10月", newSub: 1200, churn: 280 },
  { month: "11月", newSub: 1450, churn: 310 },
  { month: "12月", newSub: 1800, churn: 250 },
  { month: "1月", newSub: 2100, churn: 340 },
  { month: "2月", newSub: 2400, churn: 290 },
  { month: "3月", newSub: 2800, churn: 320 },
];

export default function SubscriptionAdminPage() {
  const [couponDiscount, setCouponDiscount] = useState("20");
  const [couponPeriod, setCouponPeriod] = useState("30");
  const [couponPlan, setCouponPlan] = useState("plus");
  const [couponLimit, setCouponLimit] = useState("100");

  const kpis = [
    { icon: "💰", label: "MRR", value: "¥4,234,500" },
    { icon: "💎", label: "有料会員", value: "15,234" },
    { icon: "📉", label: "解約率", value: "2.8%" },
    { icon: "🏆", label: "LTV", value: "¥45,600" },
  ];

  // SVG donut chart calculations
  const donutRadius = 70;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;
  const donutSegments = planDist.map((p) => {
    const segmentLength = (p.pct / 100) * donutCircumference;
    const segment = { ...p, offset: donutOffset, length: segmentLength };
    donutOffset += segmentLength;
    return segment;
  });

  const maxNewSub = Math.max(...monthlySubData.map((d) => d.newSub));

  // Paid plans only for donation link
  const paidPlans = mockPlans.filter((p) => p.donationAmount > 0);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#0D1B2A] mb-6">💎 サブスク管理</h1>

      {/* KPI Cards */}
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
            <p className="text-3xl font-bold tabular-nums text-[#0D1B2A]">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Plan Distribution Donut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            プラン分布
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
                className="text-2xl font-bold"
                fill="#1F2937"
              >
                15,234
              </text>
              <text
                x="90"
                y="105"
                textAnchor="middle"
                className="text-xs"
                fill="#9CA3AF"
              >
                有料会員
              </text>
            </svg>
            <div className="space-y-3">
              {planDist.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {p.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Monthly New vs Churn */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            月別 新規 vs 解約
          </h3>
          <div className="space-y-3">
            {monthlySubData.map((d) => (
              <div key={d.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-10">{d.month}</span>
                <div className="flex-1 flex gap-1">
                  <div
                    className="rounded-sm h-5"
                    style={{ width: `${(d.newSub / maxNewSub) * 100}%`, backgroundColor: "#2A9D8F" }}
                  />
                  <div
                    className="rounded-sm h-5"
                    style={{ width: `${(d.churn / maxNewSub) * 100}%`, backgroundColor: "#E63946" }}
                  />
                </div>
                <div className="text-xs text-right w-32">
                  <span className="text-emerald-600">
                    +{d.newSub.toLocaleString()}
                  </span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="text-[#E63946]">-{d.churn}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#2A9D8F]" />
              <span className="text-xs text-gray-500">新規</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#E63946]" />
              <span className="text-xs text-gray-500">解約</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Donation Link: Plan-by-plan donation amounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm border border-emerald-200 mb-8"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          🌟 プラン別月額寄付額
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paidPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl p-4 border border-emerald-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {plan.name}
                </span>
                <span className="text-xs text-gray-400">
                  {plan.donationStars}
                </span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-[#2A9D8F]">
                ¥{plan.donationAmount.toLocaleString()}
                <span className="text-xs text-gray-400 font-normal ml-1">
                  /月
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                月額¥{plan.monthlyPrice.toLocaleString()} の{" "}
                {Math.round((plan.donationAmount / plan.monthlyPrice) * 100)}%
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ※ 各プラン月額料金の10%が自動的に保護動物支援に寄付されます
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Churn Analysis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            解約理由 TOP5
          </h3>
          <div className="space-y-3">
            {churnReasons.map((r, i) => (
              <div key={r.reason}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">
                    {i + 1}. {r.reason}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {r.pct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <motion.div
                    className="bg-[#E63946] h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Churn prevention - Donation alert */}
          <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <h4 className="text-xs font-semibold text-emerald-700 mb-2">
              🌟 寄付停止アラート効果
            </h4>
            <p className="text-sm text-gray-700">
              寄付停止アラート表示後の解約撤回率:
            </p>
            <p className="text-3xl font-bold tabular-nums text-[#2A9D8F] mt-1">34%</p>
            <p className="text-xs text-gray-500 mt-1">
              「あなたの解約で保護犬3匹分の食事が失われます」表示による撤回
            </p>
          </div>
        </motion.div>

        {/* Coupon Management */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            クーポン作成
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                割引率（%）
              </label>
              <input
                type="number"
                value={couponDiscount}
                onChange={(e) => setCouponDiscount(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                有効期間（日）
              </label>
              <input
                type="number"
                value={couponPeriod}
                onChange={(e) => setCouponPeriod(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                対象プラン
              </label>
              <select
                value={couponPlan}
                onChange={(e) => setCouponPlan(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              >
                <option value="plus">YOLO+</option>
                <option value="pro">PRO</option>
                <option value="family">FAMILY</option>
                <option value="all">すべて</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                利用上限（枚）
              </label>
              <input
                type="number"
                value={couponLimit}
                onChange={(e) => setCouponLimit(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              />
            </div>
            <button className="w-full bg-[#2A9D8F] text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200">
              クーポンを発行
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
