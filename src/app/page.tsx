"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { mockPets, mockPosts } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import EmotionButtons from "@/components/EmotionButtons";

// ── Counter animation ──
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 40;
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

export default function LP() {
  const router = useRouter();
  const { isLoggedIn, loaded } = useAuth();
  const [modalPost, setModalPost] = useState<(typeof mockPosts)[0] | null>(null);

  // Logged-in users → redirect to /home
  useEffect(() => {
    if (loaded && isLoggedIn) router.replace("/home");
  }, [loaded, isLoggedIn, router]);
  const gallery = mockPosts.slice(0, 6);
  const heroPhotos = mockPets.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />

      {/* ── Section 1: Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-white to-[#F0FDFB]">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-accent mb-4">🐾 tomoni</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-xs text-gray-400 mb-6">ずっと、ともに。</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl font-bold text-navy max-w-xl leading-relaxed mb-3">
          AIがあなたのペットの、<br className="md:hidden" />最高の1枚を見つけます。
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-gray-500 text-sm md:text-base max-w-md mb-8">
          3,000枚のカメラロールから、AIが「この子の最高の瞬間」を選びます。
        </motion.p>

        {/* Hero stacked photos */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="relative w-64 h-48 mb-8">
          {heroPhotos.map((pet, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={pet.id} src={pet.imageUrl} alt={pet.name}
              className="absolute w-40 h-40 rounded-2xl object-cover border-4 border-gold shadow-xl"
              style={{
                left: `${i * 40}px`, top: `${i * 10}px`,
                transform: `rotate(${(i - 1) * 8}deg)`, zIndex: 3 - i,
              }} />
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Link href="/try"
            className="inline-block px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg md:text-xl rounded-xl shadow-lg shadow-accent/25 hover:from-accent-dark hover:to-accent transition-all">
            ✨ 無料で試してみる
          </Link>
        </motion.div>

        <motion.p animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="mt-12 text-gray-400 text-sm">↓ もっと見る</motion.p>
      </section>

      {/* ── Section 2: 3 Steps ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn><h2 className="text-2xl md:text-3xl font-bold text-center mb-12">かんたん3ステップ</h2></FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "①", icon: "📷", title: "写真を選ぶ", desc: "カメラロールからペットの写真を5枚以上選ぶだけ" },
              { n: "②", icon: "🤖", title: "AIが分析", desc: "画質・表情・あなたの好みを学習して最高の1枚を選定" },
              { n: "③", icon: "💝", title: "家族にシェア", desc: "金フレーム付きのベストショットをLINEで家族に送る" },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.15}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <p className="text-accent text-sm font-bold mb-1">{s.n}</p>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Before/After ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeIn><h2 className="text-2xl md:text-3xl font-bold text-center mb-12">AIが選ぶと、こう変わります</h2></FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
              <div className="text-center">
                <div className="w-48 h-48 rounded-2xl border-4 border-gray-300 overflow-hidden mx-auto mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mockPets[5].imageUrl} alt="" className="w-full h-full object-cover opacity-70" />
                </div>
                <p className="text-sm text-gray-500">あなたが選んだ写真</p>
              </div>
              <div className="text-3xl">→</div>
              <div className="text-center">
                <div className="w-48 h-48 rounded-2xl border-4 border-gold overflow-hidden mx-auto mb-3 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mockPets[0].imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold text-accent">AIが選んだベストショット ✨</p>
                <p className="text-xs text-gray-500 mt-1">「瞳がキラキラ輝く最高の瞬間」</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Section 4: Gallery ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn><h2 className="text-2xl md:text-3xl font-bold text-center mb-8">今日の人気ペット 🔥</h2></FadeIn>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
            {gallery.map((post) => (
              <FadeIn key={post.id}>
                <div className="flex-shrink-0 w-44 cursor-pointer" onClick={() => setModalPost(post)}>
                  <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-gold shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-sm mt-2">{post.petName}</p>
                  <p className="text-xs text-gray-400">❤️ {post.likes}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/explore" className="text-accent font-medium text-sm hover:underline">もっと見る →</Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalPost && (
        <div className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" onClick={() => setModalPost(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modalPost.imageUrl} alt="" className="w-full aspect-square object-cover" />
            <div className="p-4">
              <p className="font-bold mb-2">{modalPost.petName}</p>
              <p className="text-sm text-gray-600 mb-3">{modalPost.caption}</p>
              <EmotionButtons emotions={modalPost.emotions} likes={modalPost.likes} comments={modalPost.comments} />
            </div>
          </div>
        </div>
      )}

      {/* ── Section 5: Features ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeIn><h2 className="text-2xl md:text-3xl font-bold text-center mb-12">ベストショットだけじゃない</h2></FadeIn>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "📖", title: "フォトブック", desc: "ベストショットを1冊の本に" },
              { icon: "🎨", title: "イラスト化", desc: "AIが油絵/水彩/アニメ風に変換" },
              { icon: "🎁", title: "グッズ化", desc: "アクスタ・マグカップ・3Dフィギュア" },
              { icon: "👑", title: "毎日のランキング", desc: "今日の1匹に選ばれるのは？" },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-xs">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.4}>
            <p className="text-center text-gray-400 text-sm mt-8">
              🔜 ペットの歌 / ペットからの手紙 / 獣医AI相談 — coming soon
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Section 6: Numbers ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { num: 12847, suffix: "人", label: "が今日笑顔に" },
              { num: 4.8, suffix: " ★★★★★", label: "ユーザー満足度", fixed: true },
              { num: 50000, suffix: "枚", label: "のベストショットを選定" },
            ].map((s) => (
              <FadeIn key={s.label}>
                <div className="bg-accent/5 rounded-2xl p-8">
                  <p className="text-3xl md:text-4xl font-bold text-accent">
                    {s.fixed ? <>{s.num}{s.suffix}</> : <Counter end={s.num} suffix={s.suffix} />}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: CTA + Footer ── */}
      <section className="py-20 px-4 bg-navy text-white text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-8">
            あなたのペットの最高の1枚、<br />見つけませんか？
          </h2>
          <Link href="/try"
            className="inline-block px-8 py-4 bg-white text-accent font-bold text-lg rounded-xl shadow-lg hover:bg-gray-50 transition-colors mb-4">
            ✨ 無料で試してみる（登録不要）
          </Link>
          <Link href="/signup" className="text-gray-300 text-sm mt-2 inline-block hover:text-white transition-colors">
            アカウントをお持ちの方 → ログイン
          </Link>
          <p className="text-gray-400 text-sm mt-4">📱 App Storeで近日公開</p>
          <div className="mt-12 pt-8 border-t border-white/10 text-gray-500 text-xs space-y-1">
            <p>tomoni.pet | GXO株式会社</p>
            <p>プライバシーポリシー | 利用規約</p>
          </div>
        </div>
      </section>
    </div>
  );
}
