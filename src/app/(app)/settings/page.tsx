"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/features/auth/AuthGate";

interface PetData {
  id: string;
  name: string;
  species: "dog" | "cat";
  breed: string;
  imageUrl: string;
}

/* ── Toggle Switch ── */
function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-3 transition-all duration-200 hover:opacity-80"
    >
      <span className="text-sm text-[#4B5563]">{label}</span>
      <div
        className={`relative h-7 w-12 rounded-full transition-all duration-200 ${
          on ? "bg-[#2A9D8F] shadow-sm shadow-[#2A9D8F]/30" : "bg-gray-300"
        }`}
      >
        <motion.div
          layout
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md"
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
      className="mb-4 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <h2 className="mb-3 text-base font-bold text-[#0D1B2A]">
        {icon && <span className="mr-1">{icon}</span>}
        {title}
      </h2>
      <div className="divide-y divide-gray-50">{children}</div>
    </motion.section>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pet, setPet] = useState<PetData | null>(null);
  const [petLoading, setPetLoading] = useState(true);

  const fetchPet = useCallback(async () => {
    try {
      const res = await fetch("/api/pets/me");
      if (res.ok) {
        const data = await res.json();
        if (data.pet) setPet(data.pet);
      }
    } catch {
      /* no fallback */
    } finally {
      setPetLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

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
            className="text-lg text-[#4B5563] transition-all duration-200 hover:text-[#0D1B2A]"
          >
            &larr; 戻る
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 text-3xl font-bold text-[#0D1B2A]"
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
                src={pet?.imageUrl || user?.avatarUrl || "/images/default-avatar.png"}
                alt={pet?.name || user?.petName || ""}
                className="h-16 w-16 rounded-full object-cover"
              />
              <button className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2A9D8F] text-xs text-white shadow-md transition-all duration-200 hover:scale-110">
                📷
              </button>
            </div>
            <div>
              <p className="text-sm font-bold">{user?.petName || pet?.name || "ペット未登録"}</p>
              <p className="text-xs text-gray-400">プロフィール画像を変更</p>
            </div>
          </div>
          {/* Username */}
          <div className="py-3">
            <label className="mb-1 block text-sm text-[#9CA3AF]">ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all duration-200 focus:border-[#2A9D8F] focus:bg-white focus:ring-2 focus:ring-[#2A9D8F]/30 focus:outline-none"
            />
          </div>
          {/* Email */}
          <div className="py-3">
            <label className="mb-1 block text-sm text-[#9CA3AF]">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all duration-200 focus:border-[#2A9D8F] focus:bg-white focus:ring-2 focus:ring-[#2A9D8F]/30 focus:outline-none"
            />
          </div>
          {/* Password */}
          <div className="py-3">
            <label className="mb-1 block text-sm text-[#9CA3AF]">パスワード</label>
            <input
              type="password"
              value="••••••••"
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all duration-200"
            />
            <button className="mt-1 text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:underline">
              パスワードを変更
            </button>
          </div>
        </Section>

        {/* ── Section 2: ペット管理 ── */}
        <Section title="ペット管理" delay={0.15}>
          {petLoading ? (
            <div className="flex items-center gap-3 py-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ) : pet ? (
            <div className="flex items-center gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-bold">{pet.name}</p>
                <p className="text-xs text-gray-400">
                  {pet.species === "dog" ? "🐶" : "🐱"} {pet.breed}
                </p>
              </div>
              <button className="rounded-xl border-2 border-[#2A9D8F] px-3 py-1.5 text-xs font-medium text-[#2A9D8F] transition-all duration-200 hover:bg-[#F0FDFB]">
                編集
              </button>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-gray-400">ペットが登録されていません</div>
          )}
          <div className="py-3">
            <button className="w-full rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm text-[#4B5563] transition-all duration-200 hover:border-[#2A9D8F] hover:text-[#2A9D8F]">
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
              className="border-l-2 border-gray-100 pl-4"
            >
              <Toggle on={nLike} onToggle={() => setNLike(!nLike)} label="いいね" />
              <Toggle on={nFollow} onToggle={() => setNFollow(!nFollow)} label="フォロー" />
              <Toggle on={nCrown} onToggle={() => setNCrown(!nCrown)} label="Crown" />
              <Toggle on={nBattle} onToggle={() => setNBattle(!nBattle)} label="Battle" />
              <Toggle on={nDare} onToggle={() => setNDare(!nDare)} label="Dare" />
              <Toggle on={nOrder} onToggle={() => setNOrder(!nOrder)} label="注文" />
              <Toggle
                on={nDonationReport}
                onToggle={() => setNDonationReport(!nDonationReport)}
                label="🌟 寄付レポート"
              />
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
          <Toggle on={rankingIn} onToggle={() => setRankingIn(!rankingIn)} label="ランキング参加" />
          <Toggle on={battleIn} onToggle={() => setBattleIn(!battleIn)} label="Battle参加" />
        </Section>

        {/* ── Section 5: サブスクリプション ── */}
        <Section title="サブスクリプション" delay={0.3}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">現在のプラン</span>
              <span className="rounded-full bg-[#2A9D8F]/10 px-2 py-0.5 text-xs font-bold text-[#2A9D8F]">
                {planLabel}
              </span>
            </div>
            <Link
              href="/subscription"
              className="text-sm font-medium text-[#2A9D8F] transition-all duration-200 hover:underline"
            >
              プランを変更する &rarr;
            </Link>
          </div>
        </Section>

        {/* ── Section 6: 寄付設定 (NEW) ── */}
        <Section title="寄付設定" delay={0.33} icon="🌟">
          {/* Donation proportion (read-only) */}
          <div className="py-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="mb-1 text-xs font-medium text-emerald-600">寄付割合</p>
              <p className="text-sm font-bold text-emerald-800">
                会員費の10%（{planLabel}: {donationPercent}）
              </p>
              <p className="mt-1 text-[10px] text-emerald-500">
                ※ 寄付割合は自動的に会員費から計算されます
              </p>
            </div>
          </div>

          {/* Donation target preference */}
          <div className="py-3">
            <p className="mb-2 text-xs text-gray-500">寄付先の希望</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "dog" as const, label: "🐶 犬" },
                { value: "cat" as const, label: "🐱 猫" },
                { value: "both" as const, label: "🐾 両方" },
                { value: "any" as const, label: "✨ おまかせ" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDonationTarget(opt.value)}
                  className={`rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
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
            <p className="mt-1 text-[10px] text-gray-400">
              毎月の寄付先からの活動レポートを受け取ります
            </p>
          </div>

          {/* Additional donation */}
          <div className="py-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setAdditionalModal(true)}
              className="w-full rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
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
              className="flex items-center justify-between py-3 text-sm text-[#4B5563] transition-all duration-200 hover:text-[#2A9D8F]"
            >
              {item.label}
              <span className="text-gray-300">&rsaquo;</span>
            </Link>
          ))}
          <div className="py-3 text-sm text-[#9CA3AF]">アプリバージョン: v1.0.0</div>
        </Section>

        {/* ── Logout & Delete ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="mb-8 space-y-3 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <button
            onClick={logout}
            className="w-full rounded-xl py-3 text-center text-sm font-medium text-[#E63946] transition-all duration-200 hover:bg-red-50"
          >
            ログアウト
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="w-full rounded-xl py-3 text-center text-sm text-[#E63946]/70 transition-all duration-200 hover:bg-red-50"
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
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <p className="mb-3 text-3xl">⚠️</p>
            <h3 className="mb-2 text-lg font-bold">本当に削除しますか？</h3>
            <p className="mb-6 text-sm text-gray-500">
              アカウントを削除すると、すべてのデータが失われます。この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-medium text-[#4B5563] transition-all duration-200 hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  logout();
                  setDeleteConfirm(false);
                }}
                className="flex-1 rounded-xl bg-[#E63946] py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#d32f3c]"
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
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 text-center">
              <p className="mb-2 text-3xl">🌟</p>
              <h3 className="text-lg font-bold">追加寄付</h3>
              <p className="mt-1 text-sm text-gray-500">今月さらに保護施設に寄付します</p>
            </div>

            <div className="mb-4 flex gap-2">
              {[100, 500, 1000, 3000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAdditionalAmount(amt)}
                  className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all duration-200 ${
                    additionalAmount === amt
                      ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-sm"
                      : "bg-gray-100 text-[#4B5563] hover:bg-gray-200"
                  }`}
                >
                  ¥{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-xs text-emerald-600">寄付金額</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                ¥{additionalAmount.toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => setAdditionalModal(false)}
              className="mb-3 w-full rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              寄付する
            </button>
            <button
              onClick={() => setAdditionalModal(false)}
              className="w-full text-center text-sm text-[#9CA3AF] transition-all duration-200 hover:text-[#4B5563]"
            >
              キャンセル
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsContent />
    </AuthGate>
  );
}
