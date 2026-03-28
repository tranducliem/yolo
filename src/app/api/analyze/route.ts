import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { photos, petName } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.log('ANTHROPIC_API_KEY not set. Returning mock results.');
      return NextResponse.json({
        success: true,
        mode: 'mock',
        results: generateMockResults(photos.length, petName),
      });
    }

    const results = await analyzeWithClaude(photos, petName, apiKey);
    return NextResponse.json({
      success: true,
      mode: 'live',
      results,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

async function analyzeWithClaude(
  photos: { name: string; base64: string; type: string }[],
  petName: string,
  apiKey: string
) {
  const imageContents = photos.map((photo, index) => ([
    {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: photo.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: photo.base64,
      },
    },
    {
      type: "text" as const,
      text: `Photo ${index + 1}: "${photo.name}"`,
    },
  ])).flat();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContents,
            {
              type: 'text',
              text: `あなたはペット写真の専門家です。上記の${photos.length}枚のペット写真（${petName}）を分析し、以下のJSON形式で回答してください。JSONのみを返し、他のテキストは含めないでください。

{
  "results": [
    {
      "photoIndex": 0,
      "totalScore": 95,
      "qualityScore": 90,
      "expressionScore": 97,
      "preferenceScore": 95,
      "smileRating": 5,
      "loveRating": 4,
      "rareRating": 3,
      "aiComment": "この写真が素晴らしい理由を日本語で20文字程度で"
    }
  ]
}

評価基準:
- qualityScore(0-100): 画質（ブレ、ピンボケ、露出、構図）
- expressionScore(0-100): ペットの表情（目の輝き、口元、耳の位置、体の姿勢）
- preferenceScore(0-100): 写真としての魅力（レア度、感情的インパクト）
- totalScore: 上記3つの加重平均（quality 25% + expression 35% + preference 40%）
- smileRating(1-5): 笑顔度の★数
- loveRating(1-5): 愛情度の★数
- rareRating(1-5): レア度の★数
- aiComment: この写真が特別な理由を日本語で。感情に訴える表現で。

全${photos.length}枚を分析し、totalScoreの高い順に上位3枚を返してください。
resultsには上位3枚のみ含めてください。`
            }
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude response as JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.results;
}

function generateMockResults(photoCount: number, petName: string) {
  const comments = [
    `窓辺の光が${petName}の瞳をキラキラにしています`,
    `この無邪気な笑顔は見ているだけで幸せになれます`,
    `お散歩中の凛とした横顔がとても美しい一枚`,
    `ふわふわの毛並みが夕陽に輝いて最高のショットです`,
    `カメラ目線のこの表情、完璧なタイミングです`,
  ];

  const indices = Array.from({ length: photoCount }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5);
  const top3 = shuffled.slice(0, 3);

  return top3.map((photoIndex, rank) => ({
    photoIndex,
    totalScore: 97 - rank * 3 + Math.floor(Math.random() * 3),
    qualityScore: 90 + Math.floor(Math.random() * 10),
    expressionScore: 88 + Math.floor(Math.random() * 12),
    preferenceScore: 85 + Math.floor(Math.random() * 15),
    smileRating: 5 - rank > 2 ? 5 - rank : 3,
    loveRating: Math.min(5, 5 - rank + Math.floor(Math.random() * 2)),
    rareRating: Math.min(5, 3 + Math.floor(Math.random() * 3)),
    aiComment: comments[rank] || comments[0],
  }));
}
