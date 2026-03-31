"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Feature = "bestshot" | "battle" | "studio" | "stats";
type Plan = "plus" | "pro" | "family";

const featureConfig: Record<Feature, { icon: string; title: string; description: string }> = {
  bestshot: {
    icon: "✨",
    title: "ベストショットAI分析",
    description:
      "今月の無料分析回数に達しました。YOLO+にアップグレードして無制限に分析しましょう。",
  },
  battle: {
    icon: "⚔️",
    title: "バトル投票",
    description: "今日の無料投票回数に達しました。YOLO+で無制限にバトルを楽しみましょう。",
  },
  studio: {
    icon: "🎨",
    title: "YOLO Studio",
    description:
      "Studioは有料プラン限定機能です。PROにアップグレードしてクリエイティブツールを使いましょう。",
  },
  stats: {
    icon: "📊",
    title: "詳細統計",
    description: "詳細な分析データはPROプラン以上でご利用いただけます。",
  },
};

const planNames: Record<Plan, string> = {
  plus: "YOLO+",
  pro: "YOLO PRO",
  family: "YOLO FAMILY",
};

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature;
  requiredPlan?: Plan;
}

export default function PaywallModal({
  isOpen,
  onClose,
  feature,
  requiredPlan = "plus",
}: PaywallModalProps) {
  const router = useRouter();
  const config = featureConfig[feature];

  const handleUpgrade = () => {
    onClose();
    router.push("/subscription");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 text-center">
              <motion.p
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                className="mb-3 text-5xl"
              >
                {config.icon}
              </motion.p>
              <h3 className="text-lg font-bold text-[#0D1B2A]">{config.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{config.description}</p>
            </div>

            <div className="mb-4 rounded-xl bg-gradient-to-r from-[#2A9D8F]/10 to-[#2A9D8F]/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">必要なプラン</p>
                  <p className="text-sm font-bold text-[#2A9D8F]">{planNames[requiredPlan]}以上</p>
                </div>
                <div className="rounded-full bg-[#2A9D8F] px-3 py-1.5">
                  <p className="text-xs font-bold text-white">💎 アップグレード</p>
                </div>
              </div>
            </div>

            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">
                🌟 有料プランの会員費の一部が保護動物の支援に使われます
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleUpgrade}
              className="mb-3 w-full rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              プランを見る
            </motion.button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
            >
              あとで
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
