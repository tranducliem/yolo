"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockPets } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";
import AuthGate from "@/components/features/auth/AuthGate";

/* ── Toggle Switch ── */
function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 transition-all duration-200 hover:opacity-80"
    >
      <span className="text-sm text-[#4B5563]">{label}</span>
      <div
        className={`w-12 h-7 rounded-full relative transition-all duration-200 ${
          on ? "bg-[#2A9D8F] shadow-sm shadow-[#2A9D8F]/30" : "bg-gray-300"
        }`}
      >
        <motion.div
          layout
          className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
          style={{ left: on ? "calc(100% - 1.625rem)" : "0.125rem" }}
        />
      </div>
    </button>
  );
}

/* ── Section wrapper ── */
function Section({
  title,
  children,
  delay = 0,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
  icon?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 mb-4"
    >
      <h2 className="text-base font-bold text-[#0D1B2A] mb-3">
        {icon && <span className="mr-1">{icon}</span>}
        {title}
      </h2>
      <div className="divide-y divide-gray-50">{children}</div>
    </motion.section>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();
  const pet = mockPets[0];

  /* ── Notification toggles ── */
  const [pushOn, setPushOn] = useState(true);
  const [nLike, setNLike] = useState(true);
  const [nFollow, setNFollow] = useState(true);
  const [nCrown, setNCrown] = useState(true);
  const [nBattle, setNBattle] = useState(true);
  const [nDare, setNDare] = useState(true);
  const [nOrder, setNOrder] = useState(true);
  const [nDonationReport, setNDonationReport] = useState(true);

  /* ── Privacy toggles ── */
  const [isPublic, setIsPublic] = useState(true);
  const [rankingIn, setRankingIn] = useState(true);
  const [battleIn, setBattleIn] = useState(true);

  /* ── Donation settings ── */
  const [donationTarget, setDonationTarget] = useState<"dog" | "cat" | "both" | "any">("both");
  const [donationReportOn, setDonationReportOn] = useState(true);

  /* ── Form fields (mock) ── */
  const [username, setUsername] = useState(user?.name || "田中さくら");
  const [email, setEmail] = useState("sakura@example.com");

  /* ── Delete confirm ── */
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /* ── Additional donation modal ── */
  const [additionalModal, setAdditionalModal] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState(500);

  const planLabel =
    user?.plan === "plus"
      ? "YOLO+"
      : user?.plan === "pro"
      ? "YOLO PRO"
      : user?.plan === "family"
      ? "YOLO FAMILY"
      : "Free";

  const donationPercent =
    user?.plan === "plus"
      ? "¥48/月"
      : user?.plan === "pro"
      ? "¥148/月"
      : user?.plan === "family"
      ? "¥298/月"
      : "¥0";

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
            className="text-[#4B5563] hover:text-[#0D1B2A] transition-all duration-200 text-lg"
          >
            &larr; 戻る
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-bold text-[#0D1B2A] mb-6"
        >
          ⚙️ 設定
        </motion.h1>

        {/* ── Section 1: アカウント ── */}
        <Section title="アカウント" delay={0.1}>
          {/* Profile image */}
          <div className="flex items-center gap-4 py-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2A9D8F] text-white rounded-full text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200">
                📷
              </button>
            </div>
            <div>
              <p className="text-sm font-bold">{user?.petName || pet.name}</p>
              <p className="text-xs text-gray-400">プロフィール画像を変更</p>
            </div>
          </div>
          {/* Username */}
          <div className="py-3">
            <label className="text-sm text-[#9CA3AF] mb-1 block">ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30 focus:border-[#2A9D8F] focus:bg-white transition-all duration-200"
            />
          </div>
          {/* Email */}
          <div className="py-3">
            <label className="text-sm text-[#9CA3AF] mb-1 block">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/30 focus:border-[#2A9D8F] focus:bg-white transition-all duration-200"
            />
          </div>
          {/* Password */}
          <div className="py-3">
            <label className="text-sm text-[#9CA3AF] mb-1 block">パスワード</label>
            <input
              type="password"
              value="••••••••"
              readOnly
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 transition-all duration-200"
            />
            <button className="text-sm text-[#2A9D8F] font-medium mt-1 hover:underline transition-all duration-200">
              パスワードを変更
            </button>
          </div>
        </Section>

        {/* ── Section 2: ペット管理 ── */}
        <Section title="ペット管理" delay={0.15}>
          <div className="flex items-center gap-3 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pet.imageUrl}
              alt={pet.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-bold">{pet.name}</p>
              <p className="text-xs text-gray-400">
                {pet.species === "dog" ? "🐶" : "🐱"} {pet.breed}
              </p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-[#2A9D8F] border-2 border-[#2A9D8F] rounded-xl hover:bg-[#F0FDFB] transition-all duration-200">
              編集
            </button>
          </div>
          <div className="py-3">
            <button className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-[#4B5563] hover:border-[#2A9D8F] hover:text-[#2A9D8F] transition-all duration-200">
              + ペットを追加
            </button>
          </div>
        </Section>

        {/* ── Section 3: 通知設定 ── */}
        <Section title="通知設定" delay={0.2}>
          <Toggle on={pushOn} onToggle={() => setPushOn(!pushOn)} label="プッシュ通知" />
          {pushOn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="pl-4 border-l-2 border-gray-100"
            >
              <Toggle on={nLike} onToggle={() => setNLike(!nLike)} label="いいね" />
              <Toggle on={nFollow} onToggle={() => setNFollow(!nFollow)} label="フォロー" />
              <Toggle on={nCrown} onToggle={() => setNCrown(!nCrown)} label="Crown" />
              <Toggle on={nBattle} onToggle={() => setNBattle(!nBattle)} label="Battle" />
              <Toggle on={nDare} onToggle={() => setNDare(!nDare)} label="Dare" />
              <Toggle on={nOrder} onToggle={() => setNOrder(!nOrder)} label="注文" />
              <Toggle on={nDonationReport} onToggle={() => setNDonationReport(!nDonationReport)} label="🌟 寄付レポート" />
            </motion.div>
          )}
        </Section>

        {/* ── Section 4: プライバシー ── */}
        <Section title="プライバシー" delay={0.25}>
          <Toggle
            on={isPublic}
            onToggle={() => setIsPublic(!isPublic)}
            label={isPublic ? "アカウント公開" : "アカウント非公開"}
          />
          <Toggle
            on={rankingIn}
            onToggle={() => setRankingIn(!rankingIn)}
            label="ランキング参加"
          />
          <Toggle
            on={battleIn}
            onToggle={() => setBattleIn(!battleIn)}
            label="Battle参加"
          />
        </Section>

        {/* ── Section 5: サブスクリプション ── */}
        <Section title="サブスクリプション" delay={0.3}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">現在のプラン</span>
              <span className="px-2 py-0.5 bg-[#2A9D8F]/10 text-[#2A9D8F] text-xs font-bold rounded-full">
                {planLabel}
              </span>
            </div>
            <Link
              href="/subscription"
              className="text-sm text-[#2A9D8F] font-medium hover:underline transition-all duration-200"
            >
              プランを変更する &rarr;
            </Link>
          </div>
        </Section>

        {/* ── Section 6: 寄付設定 (NEW) ── */}
        <Section title="寄付設定" delay={0.33} icon="🌟">
          {/* Donation proportion (read-only) */}
          <div className="py-3">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs text-emerald-600 font-medium mb-1">寄付割合</p>
              <p className="text-sm text-emerald-800 font-bold">
                会員費の10%（{planLabel}: {donationPercent}）
              </p>
              <p className="text-[10px] text-emerald-500 mt-1">
                ※ 寄付割合は自動的に会員費から計算されます
              </p>
            </div>
          </div>

          {/* Donation target preference */}
          <div className="py-3">
            <p className="text-xs text-gray-500 mb-2">寄付先の希望</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "dog" as const, label: "🐶 犬" },
                { value: "cat" as const, label: "🐱 猫" },
                { value: "both" as const, label: "🐾 両方" },
                { value: "any" as const, label: "✨ おまかせ" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDonationTarget(opt.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    donationTarget === opt.value
                      ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-sm"
                      : "bg-gray-100 text-[#4B5563] hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Donation report toggle */}
          <div className="py-3">
            <Toggle
              on={donationReportOn}
              onToggle={() => setDonationReportOn(!donationReportOn)}
              label="🌟 寄付レポート受信"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              毎月の寄付先からの活動レポートを受け取ります
            </p>
          </div>

          {/* Additional donation */}
          <div className="py-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setAdditionalModal(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] text-white text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              🐾 追加寄付: 今月さらに寄付する
            </motion.button>
          </div>
        </Section>

        {/* ── Section 7: その他 ── */}
        <Section title="その他" delay={0.38}>
          {[
            { label: "利用規約", href: "#" },
            { label: "プライバシーポリシー", href: "#" },
            { label: "ヘルプ", href: "#" },
            { label: "お問い合わせ", href: "#" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between py-3 text-sm text-[#4B5563] hover:text-[#2A9D8F] transition-all duration-200"
            >
              {item.label}
              <span className="text-gray-300">&rsaquo;</span>
            </Link>
          ))}
          <div className="py-3 text-sm text-[#9CA3AF]">
            アプリバージョン: v1.0.0
          </div>
        </Section>

        {/* ── Logout & Delete ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 mb-8 space-y-3"
        >
          <button
            onClick={logout}
            className="w-full text-center py-3 text-[#E63946] font-medium text-sm hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            ログアウト
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="w-full text-center py-3 text-[#E63946]/70 text-sm hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            アカウント削除
          </button>
        </motion.div>
      </div>

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={() => setDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
          >
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="text-lg font-bold mb-2">本当に削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-6">
              アカウントを削除すると、すべてのデータが失われます。この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-[#4B5563] font-medium text-sm hover:bg-gray-200 transition-all duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  logout();
                  setDeleteConfirm(false);
                }}
                className="flex-1 py-3 rounded-xl bg-[#E63946] text-white font-medium text-sm hover:bg-[#d32f3c] transition-all duration-200"
              >
                削除する
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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
                      ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-sm"
                      : "bg-gray-100 text-[#4B5563] hover:bg-gray-200"
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
              className="w-full text-center text-sm text-[#9CA3AF] hover:text-[#4B5563] transition-all duration-200"
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

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsContent />
    </AuthGate>
  );
}
