import type { PhotoData, AnalyzeResult } from "@/types";
import { API_CONFIG } from "@/config/site";

/**
 * Gọi Claude Vision API để phân tích ảnh thú cưng
 * Tương đương: Laravel Service class gọi external API
 */
export async function analyzeWithClaude(
  photos: PhotoData[],
  petName: string,
  apiKey: string,
): Promise<AnalyzeResult[]> {
  const imageContents: Record<string, unknown>[] = [];

  photos.forEach((photo, index) => {
    imageContents.push({
      type: "image",
      source: {
        type: "base64",
        media_type: photo.type || "image/jpeg",
        data: photo.base64,
      },
    });
    imageContents.push({
      type: "text",
      text: `Photo ${index + 1}`,
    });
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: API_CONFIG.claudeModel,
      max_tokens: API_CONFIG.maxOutputTokens,
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            {
              type: "text",
              text: buildAnalysisPrompt(photos.length, petName),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON parse failed");

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.results;
}

/**
 * Tạo mock results cho development (khi không có API key)
 */
export function generateMockResults(
  count: number,
  petName: string,
): AnalyzeResult[] {
  const comments = [
    `窓辺の光が${petName}の瞳をキラキラにしています`,
    `この無邪気な笑顔は見ているだけで幸せになれます`,
    `${petName}の凛とした横顔がとても美しい一枚`,
    `ふわふわの毛並みが最高のショットです`,
    `カメラ目線の${petName}、完璧なタイミングです`,
  ];
  const indices = Array.from({ length: count }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffled.map((photoIndex, rank) => ({
    photoIndex,
    totalScore: 97 - rank * 3 + Math.floor(Math.random() * 3),
    qualityScore: 88 + Math.floor(Math.random() * 12),
    expressionScore: 85 + Math.floor(Math.random() * 15),
    preferenceScore: 83 + Math.floor(Math.random() * 17),
    smileRating: Math.max(3, 5 - rank),
    loveRating: Math.min(5, Math.max(3, 5 - rank + Math.floor(Math.random() * 2))),
    rareRating: Math.min(5, 3 + Math.floor(Math.random() * 3)),
    aiComment: comments[rank] || comments[0],
  }));
}

function buildAnalysisPrompt(photoCount: number, petName: string): string {
  return `あなたはペット写真の専門家です。上の${photoCount}枚の${petName}の写真を分析し、ベスト3を選んでください。

以下のJSON形式のみを返してください。他のテキストは一切含めないでください。

{"results":[{"photoIndex":0,"totalScore":97,"qualityScore":92,"expressionScore":98,"preferenceScore":99,"smileRating":4,"loveRating":5,"rareRating":4,"aiComment":"この写真が素晴らしい理由を日本語15-25文字で"}]}

評価基準:
- qualityScore(0-100): 画質・構図・ブレ・露出
- expressionScore(0-100): ペットの表情・目の輝き・口元・耳の位置
- preferenceScore(0-100): 写真としての魅力・レア度・感情的インパクト
- totalScore: quality×0.25 + expression×0.35 + preference×0.40
- smileRating(1-5): 笑顔度
- loveRating(1-5): 愛情度
- rareRating(1-5): レア度
- aiComment: ${petName}の名前を含めて、感情に訴える日本語で。

totalScore上位3枚のみ返してください。`;
}
