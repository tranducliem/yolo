import { NextRequest, NextResponse } from "next/server";
import { ART_STYLES, STYLE_FILTERS, getMockComment } from "@/lib/art-styles";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { petName, photo, styleId } = body;

    if (!photo || !styleId) {
      return NextResponse.json(
        { success: false, error: "Missing photo or styleId" },
        { status: 400 },
      );
    }

    const style = ART_STYLES.find((s) => s.id === styleId);
    if (!style) {
      return NextResponse.json({ success: false, error: "Invalid styleId" }, { status: 400 });
    }

    const name = petName || "ペット";
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.log("No ANTHROPIC_API_KEY — returning mock art result");
      return NextResponse.json({
        success: true,
        mode: "mock",
        filterCSS: STYLE_FILTERS[styleId] || "saturate(1.3) contrast(1.2)",
        breed: "犬",
        species: "dog",
        comment: getMockComment(styleId, name),
        styleId: style.id,
        styleName: style.name,
      });
    }

    // Step 1: Claude Vision APIで写真の内容を記述
    const description = await describeWithClaude(photo, name, style.name, apiKey);

    // Phase 1: 画像生成APIは未接続 → フィルター情報を返す
    return NextResponse.json({
      success: true,
      mode: "mock",
      filterCSS: STYLE_FILTERS[styleId] || "saturate(1.3) contrast(1.2)",
      breed: description.breed,
      species: description.species,
      comment: description.comment,
      styleId: style.id,
      styleName: style.name,
    });
  } catch (error: unknown) {
    console.error("Art generate error:", error);
    const styleId = "ghibli";
    return NextResponse.json({
      success: true,
      mode: "mock",
      filterCSS: STYLE_FILTERS[styleId],
      breed: "犬",
      species: "dog",
      comment: getMockComment(styleId, "ペット"),
      styleId,
      styleName: "ジブリ風",
    });
  }
}

async function describeWithClaude(
  photoBase64: string,
  petName: string,
  styleName: string,
  apiKey: string,
): Promise<{ description: string; breed: string; species: string; comment: string }> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: photoBase64,
              },
            },
            {
              type: "text",
              text: `あなたはペット写真の専門家です。
この写真に写っているペットの外見を詳細に記述してください。

以下を含めてください:
- 種類（犬/猫）と推定される犬種/猫種
- 毛の色、模様、長さ
- 体のポーズ、向き
- 表情（目、口、耳の状態）
- 背景の環境
- 光の方向と強さ
- 全体的な雰囲気

また、このイラスト化作品に付けるAIコメントを日本語で80-120文字で生成してください。
ペット名は「${petName}」です。スタイルは「${styleName}」です。
コメントはスタイルの世界観に合わせて、飼い主が感動するような文章にしてください。

JSON形式のみで出力:
{"description":"A cream-colored Pomeranian with fluffy fur...","breed":"ポメラニアン","species":"dog","comment":"ジブリの世界に飛び込んだ${petName}。風に揺れる..."}`,
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

  return JSON.parse(jsonMatch[0]);
}
