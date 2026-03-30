"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { mockPlans, ambassadorRanks } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/features/auth/AuthModal";
import AmbassadorBadge from "@/components/features/ambassador/AmbassadorBadge";
import { useToast } from "@/components/ui/Toast";

function formatPrice(price: number): string {
  return price === 0 ? "¥0" : `¥${price.toLocaleString()}`;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const toast = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const currentPlan = user?.plan || "free";

  const handleSelect = (_planId: string) => {
    void _planId;
    if (!isLoggedIn) {
      setAuthModal(true);
      return;
    }
    toast.show("Coming Soon: 課金機能は準備中です");
  };

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-4 md:max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3"
        >
          <button
            onClick={() => router.back()}
            className="text-lg text-gray-600 transition-all duration-200 hover:text-gray-900"
          >
            &larr; 戻る
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-2 text-3xl font-bold text-[#0D1B2A]"
        >
          💎 プラン
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mb-2 text-sm text-[#9CA3AF]"
        >
          あなたの活動が、保護動物への寄付につながります
        </motion.p>

        {/* Current plan badge (if logged in) */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2A9D8F]/10 px-3 py-1.5 text-sm font-bold text-[#2A9D8F]">
              現在のプラン:&nbsp;
              {currentPlan === "plus"
                ? "YOLO+"
                : currentPlan === "pro"
                  ? "YOLO PRO"
                  : currentPlan === "family"
                    ? "YOLO FAMILY"
                    : "Free"}
            </span>
          </motion.div>
        )}

        {/* Yearly / Monthly toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex items-center justify-center gap-3"
        >
          <span className={`text-sm font-medium ${!isYearly ? "text-[#2A9D8F]" : "text-gray-400"}`}>
            月払い
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative h-8 w-14 rounded-full transition-all duration-200 ${
              isYearly ? "bg-[#2A9D8F]" : "bg-gray-300"
            }`}
          >
            <motion.div
              layout
              className="absolute top-1 h-6 w-6 rounded-full bg-white shadow"
              style={{ left: isYearly ? "calc(100% - 1.75rem)" : "0.25rem" }}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-medium ${isYearly ? "text-[#2A9D8F]" : "text-gray-400"}`}
            >
              年払い
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: isYearly ? 1 : 0 }}
              className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600"
            >
              2ヶ月分お得！
            </motion.span>
          </div>
        </motion.div>

        {/* Plan cards -- horizontal scroll mobile, 4-col PC */}
        <div className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {mockPlans.map((plan, i) => {
            const isCurrent = isLoggedIn && plan.id === currentPlan;
            const isRecommended = plan.recommended;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const priceSuffix = plan.monthlyPrice === 0 ? "" : isYearly ? "/年" : "/月";
            const maxAmbRank = ambassadorRanks[plan.maxAmbassadorLevel - 1];

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className={`relative flex min-w-[280px] flex-shrink-0 snap-center flex-col overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md lg:min-w-0 ${
                  isRecommended
                    ? "border-2 border-[#2A9D8F] bg-white shadow-lg shadow-[#2A9D8F]/10"
                    : plan.id === "family"
                      ? "border-2 border-[#D4A843] bg-gradient-to-br from-[#FFF8E1] to-[#FFE082] shadow-sm"
                      : "border border-gray-200 bg-white shadow-sm"
                }`}
              >
                {/* Recommended ribbon badge */}
                {isRecommended && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <div className="relative h-24 w-24 overflow-hidden">
                      <div className="absolute top-[12px] right-[-28px] w-[120px] rotate-45 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] py-1 text-center text-[10px] font-bold text-white shadow-md">
                        おすすめ
                      </div>
                    </div>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <span className="absolute -top-3 right-3 rounded-full bg-[#D4A843] px-3 py-1 text-xs font-bold whitespace-nowrap text-white">
                    現在のプラン
                  </span>
                )}

                {/* Plan name */}
                <h3 className="mb-1 text-lg font-bold text-[#0D1B2A]">{plan.name}</h3>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-[#0D1B2A] tabular-nums">
                    {formatPrice(price)}
                  </span>
                  <span className="text-sm text-gray-500">{priceSuffix}</span>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      (月あたり {formatPrice(Math.round(plan.yearlyPrice / 12))})
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-4 space-y-2">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-[#4B5563]">
                      <span className="mt-0.5 flex-shrink-0 text-[#2A9D8F]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Donation line */}
                {plan.donationAmount > 0 ? (
                  <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm leading-relaxed font-bold text-[#059669]">
                      🌟 毎月
                      <span className="text-base tabular-nums">
                        ¥{plan.donationAmount.toLocaleString()}
                      </span>
                      が保護施設に届きます {plan.donationStars}
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">寄付機能はありません</p>
                  </div>
                )}

                {/* Ambassador line */}
                <div className="mb-4 flex items-center gap-2 px-1">
                  <AmbassadorBadge level={plan.maxAmbassadorLevel} compact />
                  <p className="text-xs text-gray-500">
                    アンバサダー: {maxAmbRank?.name || "なし"}まで
                  </p>
                </div>

                {/* CTA button */}
                <div className="mt-auto">
                  {isCurrent ? (
                    <div className="rounded-xl bg-gray-100 py-3 text-center text-sm font-medium text-gray-500">
                      現在のプラン
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(plan.id)}
                      className={`flex h-12 w-full items-center justify-center rounded-xl py-3 text-center text-sm font-bold transition-all duration-200 ${
                        isRecommended
                          ? "bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                          : plan.donationAmount > 0
                            ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                            : "bg-gray-900 text-white hover:scale-[1.02] hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
                      }`}
                    >
                      {plan.donationAmount > 0 ? "🐾 動物を救う" : "このプランにする"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Free trial note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 mb-4 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#2A9D8F]/10 bg-[#2A9D8F]/5 px-4 py-2.5">
            <span className="text-lg">🎁</span>
            <p className="text-sm text-[#4B5563]">
              有料プランは<span className="font-bold text-[#2A9D8F]">7日間の無料トライアル</span>
              付き
            </p>
          </div>
        </motion.div>

        {/* Donation appeal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 text-center transition-all duration-200 hover:shadow-md"
        >
          <p className="mb-2 text-2xl">🌟</p>
          <p className="mb-1 text-sm font-bold text-emerald-800">あなたの会員費が動物を救います</p>
          <p className="text-xs text-emerald-600">
            有料プランの会員費の10%が、パートナーNPOを通じて保護犬・保護猫の支援に使われます。
            YOLOを楽しむだけで、自動的に寄付が届きます。
          </p>
        </motion.div>
      </div>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} trigger="donation" />
    </>
  );
}
