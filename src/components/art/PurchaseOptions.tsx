"use client";

import { ART_STYLES, TOTAL_STYLE_COUNT } from "@/lib/art-styles";

type Props = {
  currentStyleId: string;
  onDownload: () => void;
  onOrder: () => void;
  onMakeAnother: () => void;
  onSubscribe: () => void;
};

export default function PurchaseOptions({
  currentStyleId,
  onDownload,
  onOrder,
  onMakeAnother,
  onSubscribe,
}: Props) {
  const otherStyles = ART_STYLES.filter((s) => s.id !== currentStyleId).slice(0, 4);

  return (
    <div className="mt-6 space-y-4">
      {/* Digital download */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-5">
        <p className="text-base font-bold text-gray-800">📥 高画質ダウンロード</p>
        <p className="mt-1 text-[13px] text-gray-500">透かしなし・4096px・印刷対応</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-800">¥980</span>
            <span className="ml-1 text-xs text-gray-400">（税込）</span>
          </div>
          <button
            onClick={onDownload}
            className="rounded-xl bg-[#2A9D8F] px-6 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            📥 ダウンロード
          </button>
        </div>
      </div>

      {/* Frame print */}
      <div className="relative rounded-xl border-2 border-[#D4A843] bg-white p-5">
        <div className="absolute -top-3 right-4 rounded-full bg-[#D4A843] px-3 py-1 text-xs font-medium text-white">
          🌟 おすすめ
        </div>
        <p className="text-base font-bold text-gray-800">🖼 額装プリント（A4サイズ）</p>
        <p className="mt-1 text-[13px] text-gray-500">高品質プリント + 額縁 + 送料無料</p>
        <p className="text-[13px] text-gray-500">リビングに飾れる美しい仕上がり</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-800">¥2,980</span>
            <span className="ml-1 text-xs text-gray-400">（税込・送料無料）</span>
          </div>
          <button
            onClick={onOrder}
            className="rounded-xl bg-[#D4A843] px-6 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            🖼 注文する
          </button>
        </div>
      </div>

      {/* Make another */}
      <div className="rounded-xl bg-[#f0fdfb] p-5">
        <p className="text-base font-bold text-gray-800">🎨 別のスタイルでも作ってみる</p>

        <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
          {otherStyles.map((s) => (
            <div key={s.id} className="flex-shrink-0 text-center">
              <div
                className={`aspect-square w-20 rounded-lg ${s.bgColor} flex items-center justify-center text-2xl`}
              >
                {s.emoji}
              </div>
              <p className="mt-1 text-[11px] text-gray-600">
                {s.emoji} {s.name}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-3">
          <button
            onClick={onMakeAnother}
            className="flex-1 rounded-xl border-2 border-[#2A9D8F] px-4 py-3 text-sm font-bold text-[#2A9D8F] transition active:scale-[0.98]"
          >
            🎨 もう1枚 — ¥980
          </button>
          <button
            onClick={onSubscribe}
            className="flex-1 rounded-xl bg-[#2A9D8F] px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            🌟 YOLO+で作り放題
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          ¥480/月 — 全{TOTAL_STYLE_COUNT}スタイル使い放題
        </p>
      </div>
    </div>
  );
}
