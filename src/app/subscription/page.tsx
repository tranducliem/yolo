"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { mockPlans, ambassadorRanks } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import AuthModal from "@/components/AuthModal";
import AmbassadorBadge from "@/components/AmbassadorBadge";
import { useToast } from "@/components/Toast";

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

  const handleSelect = (planId: string) => {
    if (!isLoggedIn) {
      setAuthModal(true);
      return;
    }
    toast.show("Coming Soon: 課金機能は準備中です");
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isLoggedIn ? "pb-24 md:pb-8 lg:pl-60" : "pb-20"}`}>
      <SideNav />

      <div className="max-w-lg md:max-w-4xl mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition-all duration-200 text-lg"
          >
            &larr; 戻る
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-bold text-[#0D1B2A] mb-2"
        >
          💎 プラン
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="text-sm text-[#9CA3AF] mb-2"
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A9D8F]/10 text-[#2A9D8F] text-sm font-bold rounded-full">
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
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span
            className={`text-sm font-medium ${
              !isYearly ? "text-[#2A9D8F]" : "text-gray-400"
            }`}
          >
            月払い
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`w-14 h-8 rounded-full relative transition-all duration-200 ${
              isYearly ? "bg-[#2A9D8F]" : "bg-gray-300"
            }`}
          >
            <motion.div
              layout
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
              style={{ left: isYearly ? "calc(100% - 1.75rem)" : "0.25rem" }}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-medium ${
                isYearly ? "text-[#2A9D8F]" : "text-gray-400"
              }`}
            >
              年払い
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: isYearly ? 1 : 0 }}
              className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full"
            >
              2ヶ月分お得！
            </motion.span>
          </div>
        </motion.div>

        {/* Plan cards -- horizontal scroll mobile, 4-col PC */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible">
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
                className={`min-w-[280px] lg:min-w-0 snap-center flex-shrink-0 rounded-2xl p-5 flex flex-col relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
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
                    <div className="relative w-24 h-24 overflow-hidden">
                      <div className="absolute top-[12px] right-[-28px] w-[120px] rotate-45 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white text-[10px] font-bold text-center py-1 shadow-md">
                        おすすめ
                      </div>
                    </div>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <span className="absolute -top-3 right-3 px-3 py-1 bg-[#D4A843] text-white text-xs font-bold rounded-full whitespace-nowrap">
                    現在のプラン
                  </span>
                )}

                {/* Plan name */}
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-[#0D1B2A] tabular-nums">
                    {formatPrice(price)}
                  </span>
                  <span className="text-sm text-gray-500">{priceSuffix}</span>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      (月あたり {formatPrice(Math.round(plan.yearlyPrice / 12))})
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-[#4B5563]">
                      <span className="text-[#2A9D8F] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Donation line */}
                {plan.donationAmount > 0 ? (
                  <div className="bg-emerald-50 rounded-xl p-3 mb-3 border border-emerald-200">
                    <p className="text-sm text-[#059669] font-bold leading-relaxed">
                      🌟 毎月<span className="text-base tabular-nums">¥{plan.donationAmount.toLocaleString()}</span>が保護施設に届きます {plan.donationStars}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-400">
                      寄付機能はありません
                    </p>
                  </div>
                )}

                {/* Ambassador line */}
                <div className="flex items-center gap-2 mb-4 px-1">
                  <AmbassadorBadge level={plan.maxAmbassadorLevel} compact />
                  <p className="text-xs text-gray-500">
                    アンバサダー: {maxAmbRank?.name || "なし"}まで
                  </p>
                </div>

                {/* CTA button */}
                <div className="mt-auto">
                  {isCurrent ? (
                    <div className="py-3 rounded-xl bg-gray-100 text-center text-sm font-medium text-gray-500">
                      現在のプラン
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(plan.id)}
                      className={`w-full py-3 rounded-xl text-center text-sm font-bold transition-all duration-200 h-12 flex items-center justify-center ${
                        isRecommended
                          ? "bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                          : plan.donationAmount > 0
                          ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      {plan.donationAmount > 0
                        ? "🐾 動物を救う"
                        : "このプランにする"}
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
          className="text-center mt-6 mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2A9D8F]/5 rounded-xl border border-[#2A9D8F]/10">
            <span className="text-lg">🎁</span>
            <p className="text-sm text-[#4B5563]">
              有料プランは<span className="font-bold text-[#2A9D8F]">7日間の無料トライアル</span>付き
            </p>
          </div>
        </motion.div>

        {/* Donation appeal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 mb-8 text-center border border-emerald-200 hover:shadow-md transition-all duration-200"
        >
          <p className="text-2xl mb-2">🌟</p>
          <p className="text-sm font-bold text-emerald-800 mb-1">
            あなたの会員費が動物を救います
          </p>
          <p className="text-xs text-emerald-600">
            有料プランの会員費の10%が、パートナーNPOを通じて保護犬・保護猫の支援に使われます。
            YOLOを楽しむだけで、自動的に寄付が届きます。
          </p>
        </motion.div>
      </div>

      <BottomNav />
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        trigger="donation"
      />
    </div>
  );
}
