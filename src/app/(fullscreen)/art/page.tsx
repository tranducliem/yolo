"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ART_STYLES } from "@/lib/art-styles";

const REVIEWS = [
  {
    text: "うちのチワワが油絵になって額縁に入れました。毎朝見て癒されてます",
    name: "ミカ",
    detail: "29歳・チワワのココ",
    avatar: "M",
  },
  {
    text: "水彩風がすごく柔らかい雰囲気で、友達に見せたら大好評でした",
    name: "タクヤ",
    detail: "38歳・ゴールデンのハナ",
    avatar: "T",
  },
  {
    text: "亡くなった愛猫をアニメ風にしてもらいました。宝物です",
    name: "ユウコ",
    detail: "45歳・ペルシャのタマ",
    avatar: "Y",
  },
];

function PhotoSlot({
  aspect = "4/3",
  label,
  gradient,
  className = "",
}: {
  aspect?: string;
  label: string;
  gradient: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <div className={`absolute inset-0 ${gradient}`} />
      <div className="absolute inset-0 flex items-end p-3">
        <span className="rounded-full bg-black/10 px-2.5 py-1 text-[9px] font-medium text-white/70 backdrop-blur-sm">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function ArtLPPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount flag
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ── Sticky header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-md"
      >
        <Link href="/" className="text-sm text-gray-500">
          ← 戻る
        </Link>
        <span className="text-accent text-lg font-bold">🐾 YOLO</span>
      </motion.div>

      {/* ════════════════════════════════════════
          HERO
          ════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <PhotoSlot
          aspect="3/4"
          gradient="bg-gradient-to-b from-[#C4B8D4]/60 via-[#B8A8C8]/40 to-[#FDF8F0]"
          label="撮影: ペットの写真がイラストに変わる演出"
          className="max-h-[420px]"
        />
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-8">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-medium tracking-[0.2em] text-white/70"
          >
            PET ILLUSTRATION
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2 text-[26px] leading-[1.35] font-bold text-white drop-shadow-sm"
          >
            うちの子を
            <br />
            アートにする。
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-white/80"
          >
            写真1枚から、油絵・水彩・アニメなど6スタイルのイラストを生成。
          </motion.p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FDF8F0] px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto max-w-sm"
        >
          <Link
            href="/art/try"
            className="bg-accent shadow-accent/20 flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-bold text-white shadow-lg transition-all active:scale-[0.97]"
          >
            無料でイラスト化する
          </Link>
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-gray-400">
            <span>30秒で完了</span>
            <span className="h-3 w-px bg-gray-200" />
            <span>登録不要</span>
            <span className="h-3 w-px bg-gray-200" />
            <span>完全無料</span>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          STYLE SHOWCASE
          ════════════════════════════════════════ */}
      <section className="px-5 py-10">
        <p className="text-center text-[11px] font-medium tracking-widest text-gray-300">STYLES</p>
        <h2 className="mt-1 text-center text-[15px] font-bold">
          選べる{ART_STYLES.length}のスタイル
        </h2>

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          {mounted &&
            ART_STYLES.filter((s) => s.isFree).map(
              (s: { id: string; emoji: string; name: string }, i: number) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                >
                  <div
                    className="aspect-square"
                    style={{
                      background: `linear-gradient(135deg, ${
                        ["#E8D5B7", "#C9D5C9", "#FFD5E5", "#D5D0C8", "#FFE5B4", "#D5E8F0"][i]
                      }, ${["#D4C4A8", "#B8C4B8", "#F0C0D0", "#C0B8A8", "#F0D0A0", "#C0D0E0"][i]})`,
                    }}
                  />
                  <div className="p-2.5 text-center">
                    <p className="text-[13px] font-bold">
                      {s.emoji} {s.name}
                    </p>
                  </div>
                </motion.div>
              ),
            )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════ */}
      <section className="bg-white px-5 py-10">
        <p className="text-center text-[11px] font-medium tracking-widest text-gray-300">
          HOW IT WORKS
        </p>
        <h2 className="mt-1 text-center text-[15px] font-bold">かんたん3ステップ</h2>

        <div className="mx-auto mt-8 max-w-sm space-y-8">
          {[
            {
              step: "01",
              title: "写真をアップロード",
              desc: "スマホのカメラロールからお気に入りの1枚を選ぶだけ。",
              imgGradient: "bg-gradient-to-br from-[#E8E4E0] to-[#D4D0CC]",
              imgLabel: "撮影: スマホで写真選択している手元",
            },
            {
              step: "02",
              title: "スタイルを選ぶ",
              desc: "油絵・水彩・アニメなど6種類からタップで選択。",
              imgGradient: "bg-gradient-to-br from-[#D4D8C8] to-[#C0C8B4]",
              imgLabel: "撮影: スタイル選択画面のモック",
            },
            {
              step: "03",
              title: "イラスト完成",
              desc: "数秒でイラスト化。ダウンロードやグッズ化もできます。",
              imgGradient: "bg-gradient-to-br from-[#F0E4D4] to-[#E4D4C0]",
              imgLabel: "撮影: 完成イラストをスマホで見せているシーン",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.1 }}
            >
              <PhotoSlot
                aspect="16/10"
                gradient={item.imgGradient}
                label={item.imgLabel}
                className="rounded-xl"
              />
              <div className="mt-3 flex items-start gap-3">
                <span className="bg-accent/10 text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                  {item.step}
                </span>
                <div>
                  <p className="text-[14px] font-bold">{item.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-gray-400">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SOCIAL PROOF
          ════════════════════════════════════════ */}
      <section className="px-5 py-10">
        <p className="text-center text-[11px] font-medium tracking-widest text-gray-300">VOICE</p>
        <h2 className="mt-1 text-center text-[15px] font-bold">利用者の声</h2>

        <div className="mx-auto mt-6 max-w-sm space-y-3">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-[3px] w-4 rounded-full bg-amber-400" />
                ))}
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-gray-700">{r.text}</p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400">
                  {r.avatar}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-600">{r.name}さん</p>
                  <p className="text-[10px] text-gray-400">{r.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRODUCTS
          ════════════════════════════════════════ */}
      <section className="bg-white px-5 py-10">
        <p className="text-center text-[11px] font-medium tracking-widest text-gray-300">
          PRODUCTS
        </p>
        <h2 className="mt-1 text-center text-[15px] font-bold">イラストを形にする</h2>

        <div className="hide-scrollbar mx-auto mt-6 flex max-w-lg gap-3 overflow-x-auto pb-2">
          {[
            {
              title: "デジタルダウンロード",
              desc: "高画質PNG / PDF",
              price: "¥480",
              imgGradient: "bg-gradient-to-br from-[#F5EDE0] to-[#E8DFD0]",
            },
            {
              title: "キャンバスプリント",
              desc: "A4サイズ・フレーム付き",
              price: "¥3,980",
              imgGradient: "bg-gradient-to-br from-[#E8DBC8] to-[#D4C8B4]",
            },
            {
              title: "アクリルスタンド",
              desc: "卓上サイズ (10cm)",
              price: "¥1,980",
              imgGradient: "bg-gradient-to-br from-[#D8D4CC] to-[#C8C4BC]",
            },
          ].map((p, i) => (
            <div
              key={i}
              className="w-52 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white"
            >
              <div
                className="aspect-[4/3]"
                style={{
                  background: `linear-gradient(135deg, ${p.imgGradient.includes("F5EDE0") ? "#F5EDE0, #E8DFD0" : p.imgGradient.includes("E8DBC8") ? "#E8DBC8, #D4C8B4" : "#D8D4CC, #C8C4BC"})`,
                }}
              />
              <div className="p-3.5">
                <p className="text-[13px] font-bold">{p.title}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{p.desc}</p>
                <p className="text-accent mt-2 text-[15px] font-bold">{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <PhotoSlot
          aspect="4/3"
          gradient="bg-gradient-to-t from-[#0D1B2A]/90 via-[#0D1B2A]/50 to-[#C4B8A4]/30"
          label="撮影: ペットとイラストが並んでいるシーン"
          className="max-h-[360px]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end px-5 pb-8">
          <p className="text-center text-[20px] leading-snug font-bold text-white">
            世界に一つだけの
            <br />
            アートを作ろう。
          </p>
          <Link
            href="/art/try"
            className="text-accent mt-5 flex h-[52px] w-full max-w-xs items-center justify-center rounded-full bg-white text-[15px] font-bold shadow-lg transition-all active:scale-[0.97]"
          >
            無料でイラスト化する
          </Link>
          <span className="mt-2.5 text-[11px] text-white/50">30秒で完了 · 登録不要</span>
        </div>
      </section>

      {/* ── Other features ── */}
      <section className="border-t border-gray-100 px-5 py-8">
        <p className="text-[12px] font-medium text-gray-400">他の機能</p>
        <div className="mt-3 flex gap-2">
          {[
            { label: "ベストショット", href: "/try" },
            { label: "ペットからの手紙", href: "/letter" },
            { label: "テーマソング", href: "/song" },
          ].map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-[11px] font-medium text-gray-500 transition-colors hover:border-gray-200"
            >
              {f.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-5 py-6 text-center">
        <div className="flex justify-center gap-3 text-[10px] text-gray-400">
          <Link href="/terms" className="hover:underline">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:underline">
            プライバシーポリシー
          </Link>
          <Link href="/tokushoho" className="hover:underline">
            特商法表示
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-gray-300">© 2026 GXO Inc. — YOLO</p>
      </footer>
    </div>
  );
}
