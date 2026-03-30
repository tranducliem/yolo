import Link from "next/link";

export default function MarketingFooter() {
  return (
    <section className="bg-navy px-4 py-20 text-center text-white">
      <div className="mx-auto max-w-md">
        <h2 className="mb-4 text-2xl leading-relaxed font-bold md:text-3xl">
          あなたのペットの最高の1枚で、
          <br />
          動物を救おう
        </h2>
        <p className="mb-8 text-sm text-gray-400">写真を楽しむだけで、保護動物の支援に繋がります</p>
        <Link
          href="/try"
          className="text-accent mb-4 inline-block rounded-xl bg-white px-8 py-4 text-lg font-bold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50 active:scale-[0.98]"
        >
          無料で試してみる
        </Link>
        <p className="mt-4 text-sm text-gray-400">📱 App Storeで近日公開</p>

        {/* Sitemap links */}
        <div className="mx-auto mt-12 max-w-xl border-t border-white/10 pt-8">
          <div className="mb-10 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
            {/* Column 1 */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                YOLOを体験する
              </p>
              <div className="space-y-2">
                <Link
                  href="/try"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  ✨ ベストショットAI
                </Link>
                <Link
                  href="/home"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  🏠 ホーム
                </Link>
                <Link
                  href="/mypage"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  🐾 マイページ
                </Link>
                <Link
                  href="/donation"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  🌟 寄付活動
                </Link>
                <Link
                  href="/ambassador"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  👑 アンバサダー
                </Link>
                <Link
                  href="/subscription"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  💎 プラン
                </Link>
              </div>
            </div>
            {/* Column 2 */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                グッズ・サービス
              </p>
              <div className="space-y-2">
                <Link
                  href="/goods"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  🎁 グッズ
                </Link>
                <Link
                  href="/book"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  📖 フォトブック
                </Link>
                <Link
                  href="/studio"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  🎨 Studio
                </Link>
              </div>
            </div>
            {/* Column 3 */}
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                コミュニティ
              </p>
              <div className="space-y-2">
                <Link
                  href="/explore"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  🔍 Explore
                </Link>
                <Link
                  href="/ranking"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  🔥 ランキング
                </Link>
                <Link
                  href="/battle"
                  className="hover:text-accent block text-sm text-gray-500 transition-colors"
                >
                  ⚔️ Battle
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-gray-500">
            <p>yolo.jp | GXO株式会社 | プライバシーポリシー | 利用規約</p>
          </div>
        </div>
      </div>
    </section>
  );
}
