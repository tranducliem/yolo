"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { mockPets, mockPosts, testimonials } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import EmotionButtons from "@/components/EmotionButtons";
import FloatingCTA from "@/components/FloatingCTA";

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
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Fade in ──
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}>{children}</motion.div>
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
      className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden mx-auto cursor-col-resize select-none touch-none"
      onMouseMove={(e) => { if (e.buttons === 1) handleMove(e.clientX); }}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After (AI selected - full underneath) */}
      <div className="absolute inset-0 border-4 border-gold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mockPets[0].imageUrl} alt="" className="w-full h-full object-cover" />
      </div>
      {/* Before (user selected - clipped) */}
      <div className="absolute inset-0 border-4 border-gray-300 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mockPets[5].imageUrl} alt="" className="w-full h-full object-cover opacity-75 grayscale-[30%]" />
      </div>
      {/* Slider line */}
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 text-sm font-bold">
          {"<>"}
        </div>
      </div>
      {/* Labels */}
      <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Before</div>
      <div className="absolute bottom-3 right-3 bg-gold/90 text-white text-xs px-2 py-1 rounded-full">AI Best</div>
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
  const rescuedPhotos = [
    mockPets[6].imageUrl,
    mockPets[7].imageUrl,
    mockPets[8].imageUrl,
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* ── Floating blob keyframes ── */}
      <style jsx>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(25px, -15px) scale(0.92); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 40px) scale(0.95); }
          66% { transform: translate(-30px, -25px) scale(1.05); }
        }
      `}</style>

      {/* ── S1: Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-[#F0FDFB] via-white to-[#F0FDFB] overflow-hidden min-h-[100svh] md:min-h-screen">
        {/* Login link - top right */}
        <div className="absolute top-4 right-4 z-20">
          <Link href="/signup" className="text-sm text-gray-500 hover:text-accent transition-colors">
            ログイン
          </Link>
        </div>

        {/* Floating blob decorations - hidden on mobile for cleaner look */}
        <div className="hidden md:block">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-accent opacity-[0.07] blur-3xl pointer-events-none" style={{ animation: 'blob1 12s ease-in-out infinite' }} />
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-accent opacity-[0.06] blur-3xl pointer-events-none" style={{ animation: 'blob2 15s ease-in-out infinite' }} />
          <div className="absolute -bottom-16 left-1/4 w-80 h-80 rounded-full bg-accent opacity-[0.08] blur-3xl pointer-events-none" style={{ animation: 'blob3 18s ease-in-out infinite' }} />
        </div>

        {/* Mobile: compact layout centered in viewport */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto py-8 md:py-0">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-[32px] md:text-[48px] font-bold text-accent mb-2 md:mb-4">
            🐾 YOLO
          </motion.div>

          {/* Tagline - only on desktop */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="hidden md:block text-[14px] text-gray-400 mb-4">
            ずっと、ともに。
          </motion.p>

          {/* Main headline */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-[20px] md:text-[28px] font-bold text-navy max-w-xl leading-relaxed mb-4 md:mb-6 text-center">
            AIがペットの<br className="md:hidden" />最高の1枚を見つけます
          </motion.p>

          {/* Mock bestshot preview with gold frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-56 h-56 md:w-64 md:h-64 mb-5 md:mb-6"
          >
            <div className="w-full h-full rounded-2xl border-4 border-gold shadow-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mockPets[0].imageUrl} alt="ベストショット例"
                className="w-full h-full object-cover" />
            </div>
            {/* Badge overlay */}
            <div className="absolute top-2 left-2 bg-gold/95 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              🥇 1st Best Shot
            </div>
            {/* Score overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl p-3">
              <p className="text-white text-xs font-medium">笑顔★★★★★ 愛情★★★★☆</p>
            </div>
          </motion.div>

          {/* CTA Button - prominent, full width on mobile */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="w-full md:w-auto">
            <Link href="/try"
              className="flex items-center justify-center w-full md:w-auto md:inline-flex px-8 h-14 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold text-lg rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              ✨ 無料でベストショットを試す
            </Link>
          </motion.div>

          {/* Sub-CTA text */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="text-[14px] text-gray-400 mt-3">
            登録不要・15秒で結果 📷
          </motion.p>
        </div>

        {/* Scroll indicator - only on desktop */}
        <motion.p animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="hidden md:block absolute bottom-6 text-gray-400 text-sm">scroll</motion.p>
      </section>

      {/* ── S2: 3 steps ── */}
      <section className="py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          <FadeIn><h2 className="text-2xl md:text-3xl font-bold text-[#0D1B2A] text-center mb-12">かんたん3ステップ</h2></FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "1", icon: "camera", title: "写真を選ぶ", desc: "カメラロールからペットの写真を5枚以上選ぶだけ" },
              { n: "2", icon: "ai", title: "AIが分析", desc: "画質・表情・あなたの好みを学習して最高の1枚を選定" },
              { n: "3", icon: "share", title: "家族にシェア", desc: "金フレーム付きのベストショットをLINEで家族に送る" },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.15}>
                <div className="bg-white rounded-2xl p-5 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">
                      {s.icon === "camera" ? "📷" : s.icon === "ai" ? "🤖" : "💝"}
                    </span>
                  </div>
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-sm font-bold mb-2">{s.n}</div>
                  <h3 className="font-bold text-lg text-[#0D1B2A] mb-2">{s.title}</h3>
                  <p className="text-[#4B5563] text-sm">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── S3: Before/After ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0D1B2A] text-center mb-4">AIが選ぶと、こう変わります</h2>
            <p className="text-[#9CA3AF] text-sm text-center mb-10">スライダーを動かして比較してください</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <BeforeAfterSlider />
            <div className="flex justify-center gap-8 mt-4">
              <p className="text-sm text-gray-500">あなたが選んだ写真</p>
              <p className="text-sm font-bold text-accent">AIが選んだベストショット</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── S4: Popular Pets (9, horizontal scroll) ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn><h2 className="text-2xl md:text-3xl font-bold text-[#0D1B2A] text-center mb-8">🔥 今日の人気ペット</h2></FadeIn>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
            {popularPosts.map((post) => (
              <FadeIn key={post.id}>
                <div className="flex-shrink-0 w-44 cursor-pointer" onClick={() => setModalPost(post)}>
                  <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-gold shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="font-bold text-sm mt-2">{post.petName}</p>
                  <p className="text-xs text-gray-400">{post.likes} likes</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/explore" className="text-accent font-medium text-sm hover:underline transition-all duration-200">もっと見る →</Link>
          </div>
        </div>
      </section>

      {/* Modal for post tap */}
      <AnimatePresence>
        {modalPost && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4"
            onClick={() => setModalPost(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={modalPost.imageUrl} alt="" className="w-full aspect-square object-cover" />
              <div className="p-4">
                <p className="font-bold mb-1">{modalPost.petName}</p>
                <p className="text-xs text-gray-400 mb-2">{modalPost.ownerName} ・ {modalPost.createdAt}</p>
                <p className="text-sm text-gray-600 mb-3">{modalPost.caption}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {modalPost.tags.map((t) => (
                    <span key={t} className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <EmotionButtons emotions={modalPost.emotions} likes={modalPost.likes} comments={modalPost.comments} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── S5: Features ── */}
      <section className="py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          <FadeIn><h2 className="text-2xl md:text-3xl font-bold text-[#0D1B2A] text-center mb-12">ベストショットだけじゃない</h2></FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🏆", title: "Crown", desc: "毎日1匹がTOPに選ばれる。あなたのペットが今日の主役に！コミュニティの注目を独占しよう。" },
              { icon: "⚔️", title: "Battle", desc: "可愛さ対決！2匹のペットが可愛さを競い合う。投票で推しを応援しよう。" },
              { icon: "📖", title: "フォトブック", desc: "ベストショットを1冊の本に。シンプルからプレミアムまで3テンプレートで簡単作成。" },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.15}>
                <div className="bg-white rounded-2xl p-5 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-lg text-[#0D1B2A] mb-2">{f.title}</h3>
                  <p className="text-[#4B5563] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: Donation Section ── */}
      <section className="py-20 px-4 bg-[#F0FDF4]">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0D1B2A] text-center mb-4">
              🌟 あなたの写真が、動物の命を救います
            </h2>
            <p className="text-[#4B5563] text-center text-sm md:text-base mb-10 max-w-lg mx-auto">
              YOLOでは、会員の皆さまの月額の一部が保護施設に届けられています
            </p>
          </FadeIn>

          {/* Animated donation counter */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-8 md:p-10 text-center mb-10">
              <p className="text-[#9CA3AF] text-sm mb-2">これまでに届けた食事</p>
              <div className="text-4xl md:text-5xl font-bold text-accent tabular-nums mb-2">
                <Counter end={12847} suffix="匹" />
              </div>
              <p className="text-[#9CA3AF] text-sm">の食事を届けました</p>
              <div className="flex justify-center gap-6 mt-6 text-sm text-[#4B5563]">
                <div className="text-center">
                  <p className="text-3xl font-bold tabular-nums text-accent">3</p>
                  <p className="text-xs text-[#9CA3AF]">支援先NPO</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold tabular-nums text-accent">47</p>
                  <p className="text-xs text-[#9CA3AF]">都道府県</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold tabular-nums text-accent">12,000+</p>
                  <p className="text-xs text-[#9CA3AF]">寄付者</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 3 Before/After rescued animals */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
              {rescuedPhotos.map((url, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden shadow-md group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3">
                    <p className="text-white text-[10px] md:text-xs font-medium">
                      {["保護 → 新しい家族へ", "治療後、元気に回復", "愛情いっぱいの毎日"][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="text-center">
              <Link href="/donation"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#059669] to-[#047857] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                🌟 詳しく見る
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── S7: CTA + Footer ── */}
      <section className="py-20 px-4 bg-navy text-white text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-4">
            あなたのペットの最高の1枚で、<br />動物を救おう
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            写真を楽しむだけで、保護動物の支援に繋がります
          </p>
          <Link href="/try"
            className="inline-block px-8 py-4 bg-white text-accent font-bold text-lg rounded-xl shadow-lg hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-4">
            無料で試してみる
          </Link>
          <p className="text-gray-400 text-sm mt-4">📱 App Storeで近日公開</p>

          {/* Sitemap links */}
          <div className="mt-12 pt-8 border-t border-white/10 max-w-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-10">
              {/* Column 1 */}
              <div>
                <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">YOLOを体験する</p>
                <div className="space-y-2">
                  <Link href="/try" className="block text-sm text-gray-500 hover:text-accent transition-colors">✨ ベストショットAI</Link>
                  <Link href="/home" className="block text-sm text-gray-500 hover:text-accent transition-colors">🏠 ホーム</Link>
                  <Link href="/mypage" className="block text-sm text-gray-500 hover:text-accent transition-colors">🐾 マイページ</Link>
                  <Link href="/donation" className="block text-sm text-gray-500 hover:text-accent transition-colors">🌟 寄付活動</Link>
                  <Link href="/ambassador" className="block text-sm text-gray-500 hover:text-accent transition-colors">👑 アンバサダー</Link>
                  <Link href="/subscription" className="block text-sm text-gray-500 hover:text-accent transition-colors">💎 プラン</Link>
                </div>
              </div>
              {/* Column 2 */}
              <div>
                <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">グッズ・サービス</p>
                <div className="space-y-2">
                  <Link href="/goods" className="block text-sm text-gray-500 hover:text-accent transition-colors">🎁 グッズ</Link>
                  <Link href="/book" className="block text-sm text-gray-500 hover:text-accent transition-colors">📖 フォトブック</Link>
                  <Link href="/studio" className="block text-sm text-gray-500 hover:text-accent transition-colors">🎨 Studio</Link>
                </div>
              </div>
              {/* Column 3 */}
              <div>
                <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">コミュニティ</p>
                <div className="space-y-2">
                  <Link href="/explore" className="block text-sm text-gray-500 hover:text-accent transition-colors">🔍 Explore</Link>
                  <Link href="/ranking" className="block text-sm text-gray-500 hover:text-accent transition-colors">🔥 ランキング</Link>
                  <Link href="/battle" className="block text-sm text-gray-500 hover:text-accent transition-colors">⚔️ Battle</Link>
                </div>
              </div>
            </div>
            <div className="text-gray-500 text-xs space-y-1">
              <p>yolo.jp | GXO株式会社 | プライバシーポリシー | 利用規約</p>
            </div>
          </div>
        </div>
      </section>
      <FloatingCTA hasBottomNav={false} />
    </div>
  );
}
