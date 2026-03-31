"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { mockPets, mockPosts } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EmotionButtons from "@/components/features/social/EmotionButtons";
import FloatingCTA from "@/components/ui/FloatingCTA";

// ── Counter animation ──
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 60;
    const step = () => {
      frame++;
      setVal(Math.round((frame / total) * end));
      if (frame < total) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Fade in ──
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Before/After Slider ──
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-72 w-72 cursor-col-resize touch-none overflow-hidden rounded-2xl select-none md:h-80 md:w-80"
      onMouseMove={(e) => {
        if (e.buttons === 1) handleMove(e.clientX);
      }}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After (AI selected - full underneath) */}
      <div className="border-gold absolute inset-0 border-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mockPets[0].imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      {/* Before (user selected - clipped) */}
      <div
        className="absolute inset-0 overflow-hidden border-4 border-gray-300"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mockPets[5].imageUrl}
          alt=""
          className="h-full w-full object-cover opacity-75 grayscale-[30%]"
        />
      </div>
      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 z-10 w-1 bg-white shadow-lg"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-500 shadow-lg">
          {"<>"}
        </div>
      </div>
      {/* Labels */}
      <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
        Before
      </div>
      <div className="bg-gold/90 absolute right-3 bottom-3 rounded-full px-2 py-1 text-xs text-white">
        AI Best
      </div>
    </div>
  );
}

export default function LP() {
  const router = useRouter();
  const { isLoggedIn, loaded } = useAuth();
  const [modalPost, setModalPost] = useState<(typeof mockPosts)[0] | null>(null);

  // Logged-in users -> redirect to /home
  useEffect(() => {
    if (loaded && isLoggedIn) router.replace("/home");
  }, [loaded, isLoggedIn, router]);

  const popularPosts = mockPosts.slice(0, 9);

  // Dog photos for rescued animals section
  const rescuedPhotos = [mockPets[6].imageUrl, mockPets[7].imageUrl, mockPets[8].imageUrl];

  return (
    <div className="min-h-screen">
      <Header variant="marketing" />

      {/* ── Floating blob keyframes ── */}
      <style jsx>{`
        @keyframes blob1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
        @keyframes blob2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 30px) scale(1.08);
          }
          66% {
            transform: translate(25px, -15px) scale(0.92);
          }
        }
        @keyframes blob3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, 40px) scale(0.95);
          }
          66% {
            transform: translate(-30px, -25px) scale(1.05);
          }
        }
      `}</style>

      {/* ── S1: Hero ── */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F0FDFB] via-white to-[#F0FDFB] px-4 text-center md:min-h-screen">
        {/* Login link - top right */}
        <div className="absolute top-4 right-4 z-20">
          <Link
            href="/signup"
            className="hover:text-accent text-sm text-gray-500 transition-colors"
          >
            ログイン
          </Link>
        </div>

        {/* Floating blob decorations - hidden on mobile for cleaner look */}
        <div className="hidden md:block">
          <div
            className="bg-accent pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full opacity-[0.07] blur-3xl"
            style={{ animation: "blob1 12s ease-in-out infinite" }}
          />
          <div
            className="bg-accent pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full opacity-[0.06] blur-3xl"
            style={{ animation: "blob2 15s ease-in-out infinite" }}
          />
          <div
            className="bg-accent pointer-events-none absolute -bottom-16 left-1/4 h-80 w-80 rounded-full opacity-[0.08] blur-3xl"
            style={{ animation: "blob3 18s ease-in-out infinite" }}
          />
        </div>

        {/* Mobile: compact layout centered in viewport */}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 md:py-0">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent mb-2 text-[32px] font-bold md:mb-4 md:text-[48px]"
          >
            🐾 YOLO
          </motion.div>

          {/* Tagline - only on desktop */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 hidden text-[14px] text-gray-400 md:block"
          >
            ずっと、ともに。
          </motion.p>

          {/* Main headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-navy mb-4 max-w-xl text-center text-[20px] leading-relaxed font-bold md:mb-6 md:text-[28px]"
          >
            AIがペットの
            <br className="md:hidden" />
            最高の1枚を見つけます
          </motion.p>

          {/* Mock bestshot preview with gold frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 20 }}
            className="relative mb-5 h-56 w-56 md:mb-6 md:h-64 md:w-64"
          >
            <div className="border-gold h-full w-full overflow-hidden rounded-2xl border-4 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mockPets[0].imageUrl}
                alt="ベストショット例"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Badge overlay */}
            <div className="bg-gold/95 absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              🥇 1st Best Shot
            </div>
            {/* Score overlay at bottom */}
            <div className="absolute right-0 bottom-0 left-0 rounded-b-2xl bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-xs font-medium text-white">笑顔★★★★★ 愛情★★★★☆</p>
            </div>
          </motion.div>

          {/* CTA Button - prominent, full width on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full md:w-auto"
          >
            <Link
              href="/try"
              className="shadow-accent/25 flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] px-8 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] md:inline-flex md:w-auto"
            >
              ✨ 無料でベストショットを試す
            </Link>
          </motion.div>

          {/* Sub-CTA text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-3 text-[14px] text-gray-400"
          >
            登録不要・15秒で結果 📷
          </motion.p>
        </div>

        {/* Scroll indicator - only on desktop */}
        <motion.p
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 hidden text-sm text-gray-400 md:block"
        >
          scroll
        </motion.p>
      </section>

      {/* ── S2: 3 steps ── */}
      <section className="bg-[#F8FAFC] px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="mb-12 text-center text-2xl font-bold text-[#0D1B2A] md:text-3xl">
              かんたん3ステップ
            </h2>
          </FadeIn>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                n: "1",
                icon: "camera",
                title: "写真を選ぶ",
                desc: "カメラロールからペットの写真を5枚以上選ぶだけ",
              },
              {
                n: "2",
                icon: "ai",
                title: "AIが分析",
                desc: "画質・表情・あなたの好みを学習して最高の1枚を選定",
              },
              {
                n: "3",
                icon: "share",
                title: "家族にシェア",
                desc: "金フレーム付きのベストショットをLINEで家族に送る",
              },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.15}>
                <div className="rounded-2xl bg-white p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="bg-accent/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <span className="text-2xl">
                      {s.icon === "camera" ? "📷" : s.icon === "ai" ? "🤖" : "💝"}
                    </span>
                  </div>
                  <div className="bg-accent mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
                    {s.n}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#0D1B2A]">{s.title}</h3>
                  <p className="text-sm text-[#4B5563]">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── S3: Before/After ── */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="mb-4 text-center text-2xl font-bold text-[#0D1B2A] md:text-3xl">
              AIが選ぶと、こう変わります
            </h2>
            <p className="mb-10 text-center text-sm text-[#9CA3AF]">
              スライダーを動かして比較してください
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <BeforeAfterSlider />
            <div className="mt-4 flex justify-center gap-8">
              <p className="text-sm text-gray-500">あなたが選んだ写真</p>
              <p className="text-accent text-sm font-bold">AIが選んだベストショット</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── S4: Popular Pets (9, horizontal scroll) ── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="mb-8 text-center text-2xl font-bold text-[#0D1B2A] md:text-3xl">
              🔥 今日の人気ペット
            </h2>
          </FadeIn>
          <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-4">
            {popularPosts.map((post) => (
              <FadeIn key={post.id}>
                <div
                  className="w-44 flex-shrink-0 cursor-pointer"
                  onClick={() => setModalPost(post)}
                >
                  <div className="border-gold h-44 w-44 overflow-hidden rounded-2xl border-2 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 text-sm font-bold">{post.petName}</p>
                  <p className="text-xs text-gray-400">{post.likes} likes</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/explore"
              className="text-accent text-sm font-medium transition-all duration-200 hover:underline"
            >
              もっと見る →
            </Link>
          </div>
        </div>
      </section>

      {/* Modal for post tap */}
      <AnimatePresence>
        {modalPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setModalPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={modalPost.imageUrl} alt="" className="aspect-square w-full object-cover" />
              <div className="p-4">
                <p className="mb-1 font-bold">{modalPost.petName}</p>
                <p className="mb-2 text-xs text-gray-400">
                  {modalPost.ownerName} ・ {modalPost.createdAt}
                </p>
                <p className="mb-3 text-sm text-gray-600">{modalPost.caption}</p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {modalPost.tags.map((t) => (
                    <span
                      key={t}
                      className="text-accent bg-accent/10 rounded-full px-2 py-0.5 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <EmotionButtons
                  emotions={modalPost.emotions}
                  likes={modalPost.likes}
                  comments={modalPost.comments}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── S5: Features ── */}
      <section className="bg-[#F8FAFC] px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="mb-12 text-center text-2xl font-bold text-[#0D1B2A] md:text-3xl">
              ベストショットだけじゃない
            </h2>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🏆",
                title: "Crown",
                desc: "毎日1匹がTOPに選ばれる。あなたのペットが今日の主役に！コミュニティの注目を独占しよう。",
              },
              {
                icon: "⚔️",
                title: "Battle",
                desc: "可愛さ対決！2匹のペットが可愛さを競い合う。投票で推しを応援しよう。",
              },
              {
                icon: "📖",
                title: "フォトブック",
                desc: "ベストショットを1冊の本に。シンプルからプレミアムまで3テンプレートで簡単作成。",
              },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.15}>
                <div className="rounded-2xl bg-white p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-3 text-4xl">{f.icon}</div>
                  <h3 className="mb-2 text-lg font-bold text-[#0D1B2A]">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-[#4B5563]">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: Donation Section ── */}
      <section className="bg-[#F0FDF4] px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="mb-4 text-center text-2xl font-bold text-[#0D1B2A] md:text-3xl">
              🌟 あなたの写真が、動物の命を救います
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-center text-sm text-[#4B5563] md:text-base">
              YOLOでは、会員の皆さまの月額の一部が保護施設に届けられています
            </p>
          </FadeIn>

          {/* Animated donation counter */}
          <FadeIn delay={0.2}>
            <div className="mb-10 rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-lg md:p-10">
              <p className="mb-2 text-sm text-[#9CA3AF]">これまでに届けた食事</p>
              <div className="text-accent mb-2 text-4xl font-bold tabular-nums md:text-5xl">
                <Counter end={12847} suffix="匹" />
              </div>
              <p className="text-sm text-[#9CA3AF]">の食事を届けました</p>
              <div className="mt-6 flex justify-center gap-6 text-sm text-[#4B5563]">
                <div className="text-center">
                  <p className="text-accent text-3xl font-bold tabular-nums">3</p>
                  <p className="text-xs text-[#9CA3AF]">支援先NPO</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-accent text-3xl font-bold tabular-nums">47</p>
                  <p className="text-xs text-[#9CA3AF]">都道府県</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-accent text-3xl font-bold tabular-nums">12,000+</p>
                  <p className="text-xs text-[#9CA3AF]">寄付者</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 3 Before/After rescued animals */}
          <FadeIn delay={0.3}>
            <div className="mb-8 grid grid-cols-3 gap-3 md:gap-6">
              {rescuedPhotos.map((url, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3">
                    <p className="text-[10px] font-medium text-white md:text-xs">
                      {["保護 → 新しい家族へ", "治療後、元気に回復", "愛情いっぱいの毎日"][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="text-center">
              <Link
                href="/donation"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                🌟 詳しく見る
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
      <FloatingCTA hasBottomNav={false} />
    </div>
  );
}
