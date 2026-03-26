import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { petName, imageCount } = await request.json();
  const n = imageCount || 10;

  const comments = [
    `${petName}の瞳がキラキラ輝いている最高の瞬間`,
    "風に吹かれた毛並みが美しい一枚",
    "思わず笑顔になる愛らしい表情",
    "カメラ目線がバッチリ決まったベストショット",
    `リラックスした自然体の${petName}が最高に可愛い`,
  ];

  const results = Array.from({ length: n }, (_, i) => ({
    index: i,
    totalScore: 80 + ((i * 31) % 20),
    comment: comments[i % comments.length],
    smileScore: 78 + ((i * 17) % 20),
    loveScore: 78 + ((i * 23) % 20),
  }));

  const sorted = [...results].sort((a, b) => b.totalScore - a.totalScore);
  await new Promise((r) => setTimeout(r, 2000));
  return NextResponse.json({ photos: results, ranking: sorted.slice(0, 3).map((r) => r.index) });
}
