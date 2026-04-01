"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PLANS } from "@/config/plans";

const planColors: Record<string, string> = {
  free: "#9CA3AF",
  plus: "#3B82F6",
  pro: "#8B5CF6",
  family: "#D4A843",
};

const planLabels: Record<string, string> = {
  free: "Free",
  plus: "YOLO+",
  pro: "PRO",
  family: "FAMILY",
};

interface SubStats {
  totalPaid: number;
  planDistribution: Record<string, number>;
}

export default function SubscriptionAdminPage() {
  const [couponDiscount, setCouponDiscount] = useState("20");
  const [couponPeriod, setCouponPeriod] = useState("30");
  const [couponPlan, setCouponPlan] = useState("plus");
  const [couponLimit, setCouponLimit] = useState("100");
  const [stats, setStats] = useState<SubStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscriptions");
      if (res.ok) {
        const data = await res.json();
        const subs = data.subscriptions ?? [];
        const dist: Record<string, number> = { free: 0, plus: 0, pro: 0, family: 0 };
        subs.forEach((s: { plan: string }) => {
          if (dist[s.plan] !== undefined) dist[s.plan]++;
        });
        setStats({ totalPaid: subs.length, planDistribution: dist });
      }
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPaid = stats?.totalPaid ?? 0;
  const dist = stats?.planDistribution ?? { free: 0, plus: 0, pro: 0, family: 0 };
  const totalSubs = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  const planDist = Object.entries(dist).map(([plan, count]) => ({
    name: planLabels[plan] ?? plan,
    pct: Math.round((count / totalSubs) * 100),
    color: planColors[plan] ?? "#9CA3AF",
  }));

  const kpis = [
    { icon: "💰", label: "MRR", value: `¥${(totalPaid * 480).toLocaleString()}` },
    { icon: "💎", label: "有料会員", value: totalPaid.toLocaleString() },
    { icon: "📉", label: "解約率", value: totalPaid > 0 ? "—" : "0%" },
    { icon: "🏆", label: "LTV", value: totalPaid > 0 ? "—" : "¥0" },
  ];

  // SVG donut chart calculations
  const donutRadius = 70;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutSegments = planDist.reduce<
    ((typeof planDist)[number] & { offset: number; length: number })[]
  >((acc, p) => {
    const offset = acc.reduce((sum, seg) => sum + seg.length, 0);
    const segmentLength = (p.pct / 100) * donutCircumference;
    acc.push({ ...p, offset, length: segmentLength });
    return acc;
  }, []);

  const churnReasons = [{ reason: "データ収集中", pct: 100 }];
  const monthlySubData: { month: string; newSub: number; churn: number }[] = [];
  const maxNewSub = Math.max(1, ...monthlySubData.map((d) => d.newSub));

  // Paid plans only for donation link
  const paidPlans = PLANS.filter((p) => p.donationAmount > 0);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold text-[#0D1B2A]">💎 サブスク管理</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#0D1B2A]">💎 サブスク管理</h1>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-sm text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold text-[#0D1B2A] tabular-nums">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Plan Distribution Donut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-700">プラン分布</h3>
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
              <text x="90" y="85" textAnchor="middle" className="text-2xl font-bold" fill="#1F2937">
                {totalPaid.toLocaleString()}
              </text>
              <text x="90" y="105" textAnchor="middle" className="text-xs" fill="#9CA3AF">
                有料会員
              </text>
            </svg>
            <div className="space-y-3">
              {planDist.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <span className="text-sm font-bold text-gray-900">{p.pct}%</span>
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
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-700">月別 新規 vs 解約</h3>
          <div className="space-y-3">
            {monthlySubData.map((d) => (
              <div key={d.month} className="flex items-center gap-3">
                <span className="w-10 text-xs text-gray-500">{d.month}</span>
                <div className="flex flex-1 gap-1">
                  <div
                    className="h-5 rounded-sm"
                    style={{
                      width: `${(d.newSub / maxNewSub) * 100}%`,
                      backgroundColor: "#2A9D8F",
                    }}
                  />
                  <div
                    className="h-5 rounded-sm"
                    style={{ width: `${(d.churn / maxNewSub) * 100}%`, backgroundColor: "#E63946" }}
                  />
                </div>
                <div className="w-32 text-right text-xs">
                  <span className="text-emerald-600">+{d.newSub.toLocaleString()}</span>
                  <span className="mx-1 text-gray-300">/</span>
                  <span className="text-[#E63946]">-{d.churn}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-[#2A9D8F]" />
              <span className="text-xs text-gray-500">新規</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-[#E63946]" />
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
        className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm"
      >
        <h3 className="mb-4 text-sm font-semibold text-gray-700">🌟 プラン別月額寄付額</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {paidPlans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-emerald-100 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                <span className="text-xs text-gray-400">{plan.donationStars}</span>
              </div>
              <p className="text-2xl font-bold text-[#2A9D8F] tabular-nums">
                ¥{plan.donationAmount.toLocaleString()}
                <span className="ml-1 text-xs font-normal text-gray-400">/月</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                月額¥{plan.monthlyPrice.toLocaleString()} の{" "}
                {Math.round((plan.donationAmount / plan.monthlyPrice) * 100)}%
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          ※ 各プラン月額料金の10%が自動的に保護動物支援に寄付されます
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Churn Analysis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-700">解約理由 TOP5</h3>
          <div className="space-y-3">
            {churnReasons.map((r, i) => (
              <div key={r.reason}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {i + 1}. {r.reason}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{r.pct}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <motion.div
                    className="h-3 rounded-full bg-[#E63946]"
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Churn prevention - Donation alert */}
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h4 className="mb-2 text-xs font-semibold text-emerald-700">🌟 寄付停止アラート効果</h4>
            <p className="text-sm text-gray-700">寄付停止アラート表示後の解約撤回率:</p>
            <p className="mt-1 text-3xl font-bold text-[#2A9D8F] tabular-nums">34%</p>
            <p className="mt-1 text-xs text-gray-500">
              「あなたの解約で保護犬3匹分の食事が失われます」表示による撤回
            </p>
          </div>
        </motion.div>

        {/* Coupon Management */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-700">クーポン作成</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">割引率（%）</label>
              <input
                type="number"
                value={couponDiscount}
                onChange={(e) => setCouponDiscount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">有効期間（日）</label>
              <input
                type="number"
                value={couponPeriod}
                onChange={(e) => setCouponPeriod(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">対象プラン</label>
              <select
                value={couponPlan}
                onChange={(e) => setCouponPlan(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              >
                <option value="plus">YOLO+</option>
                <option value="pro">PRO</option>
                <option value="family">FAMILY</option>
                <option value="all">すべて</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">利用上限（枚）</label>
              <input
                type="number"
                value={couponLimit}
                onChange={(e) => setCouponLimit(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none"
              />
            </div>
            <button className="w-full rounded-xl bg-[#2A9D8F] py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90">
              クーポンを発行
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
