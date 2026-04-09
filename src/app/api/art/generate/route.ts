import { NextRequest, NextResponse } from "next/server";
import { ART_STYLES, STYLE_FILTERS, getMockComment } from "@/lib/art-styles";

export const maxDuration = 60;

interface GenerateResponse {
  success: boolean;
  mode: "generated" | "mock";
  generatedImageUrl: string | null;
  filterCSS: string;
  comment: string;
  styleId: string;
  styleName: string;
}

function mockResult(styleId: string, styleName: string, name: string): NextResponse {
  return NextResponse.json<GenerateResponse>({
    success: true,
    mode: "mock",
    generatedImageUrl: null,
    filterCSS: STYLE_FILTERS[styleId] || "saturate(1.3) contrast(1.2)",
    comment: getMockComment(styleId, name),
    styleId,
    styleName,
  });
}

export async function POST(request: NextRequest) {
  let parsedStyleId = "ghibli";
  let parsedStyleName = "アート";
  let parsedName = "ペット";

  try {
    const body = await request.json();
    const { petName, photo, styleId } = body as {
      petName?: string;
      photo?: string;
      styleId?: string;
    };

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

    parsedStyleId = styleId;
    parsedStyleName = style.name;
    parsedName = petName || "ペット";

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    const googleModel = process.env.GOOGLE_AI_MODEL;
    const googleBaseUrl =
      process.env.GOOGLE_AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
    const timeoutMs = parseInt(process.env.GOOGLE_AI_TIMEOUT || "120") * 1000;

    if (!googleApiKey || !googleModel) {
      console.log("[art/generate] No Google AI config — returning mock result");
      return mockResult(parsedStyleId, parsedStyleName, parsedName);
    }

    // Strip data URL prefix → pure base64 + mime type
    const base64Match = photo.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      console.warn("[art/generate] Invalid photo format");
      return mockResult(parsedStyleId, parsedStyleName, parsedName);
    }
    const mimeType = base64Match[1];
    const photoBase64 = base64Match[2];

    // Step 1: Describe the pet via Claude proxy (improves Imagen prompt quality)
    let petDescription = "";
    try {
      petDescription = await describePetForArt(photoBase64, mimeType, parsedName);
      console.log("[art/generate] Pet description:", petDescription.slice(0, 100));
    } catch (e) {
      console.warn("[art/generate] Pet description failed, using generic prompt:", e);
    }

    // Step 2: Build generation prompt
    const prompt = buildGenerationPrompt(style.prompt, style.nameEn, parsedName, petDescription);
    console.log("[art/generate] Imagen prompt:", prompt.slice(0, 120));

    // Step 3: Generate image with Google Imagen
    const generatedBase64 = await generateWithImagen(
      prompt,
      googleApiKey,
      googleModel,
      googleBaseUrl,
      timeoutMs,
    );

    return NextResponse.json<GenerateResponse>({
      success: true,
      mode: "generated",
      generatedImageUrl: `data:image/jpeg;base64,${generatedBase64}`,
      filterCSS: STYLE_FILTERS[parsedStyleId] || "",
      comment: getMockComment(parsedStyleId, parsedName),
      styleId: style.id,
      styleName: style.name,
    });
  } catch (error: unknown) {
    console.error("[art/generate] Error:", error);
    return mockResult(parsedStyleId, parsedStyleName, parsedName);
  }
}

// ── Step 1: Describe pet using Claude Vision via proxy ──────────────────────

async function describePetForArt(
  photoBase64: string,
  mimeType: string,
  petName: string,
): Promise<string> {
  const proxyUrl = process.env.PROXY_URL;
  const proxyApiKey = process.env.PROXY_API_KEY;

  if (!proxyUrl || !proxyApiKey) throw new Error("Proxy not configured");

  const response = await fetch(`${proxyUrl}/v1/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${proxyApiKey}`,
    },
    body: JSON.stringify({
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: mimeType, data: photoBase64 },
        },
        {
          type: "text",
          text: `Describe this pet photo concisely for an AI image generation prompt. Include: species (dog/cat/etc), breed, main fur colors, pattern, body size, approximate age, and notable features like ear shape or eye color. Pet name: "${petName}". Respond in ONE paragraph of plain English, max 80 words. No introduction.`,
        },
      ],
      options: { maxTurns: 1 },
      clientId: "yolo-art",
    }),
    signal: AbortSignal.timeout(30000),
  });

  const data = (await response.json()) as { success: boolean; result?: string; error?: string };
  if (!data.success) throw new Error(`Proxy error: ${data.error}`);

  return (data.result || "").trim().slice(0, 300);
}

// ── Step 2: Build Imagen prompt ─────────────────────────────────────────────

function buildGenerationPrompt(
  stylePrompt: string,
  styleNameEn: string,
  petName: string,
  petDescription: string,
): string {
  const subject = petDescription
    ? `The main subject is a pet named ${petName}: ${petDescription}`
    : `The main subject is a cute pet named ${petName}`;

  return `${stylePrompt}. ${subject}. Create a beautiful ${styleNameEn} artwork portrait with the pet as the central focus, detailed and expressive. High quality illustration.`;
}

// ── Step 3: Call Google Imagen API ──────────────────────────────────────────

async function generateWithImagen(
  prompt: string,
  apiKey: string,
  model: string,
  baseUrl: string,
  timeoutMs: number,
): Promise<string> {
  const url = `${baseUrl}/models/${model}:predict`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
      },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[art/generate] Imagen API error:", response.status, errText.slice(0, 300));
    throw new Error(`Imagen API ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await response.json()) as Record<string, any>;

  // Handle multiple possible response formats across Imagen versions
  if (data.generatedImages?.[0]?.image?.imageBytes) return data.generatedImages[0].image.imageBytes;
  if (data.predictions?.[0]?.bytesBase64Encoded) return data.predictions[0].bytesBase64Encoded;
  if (data.predictions?.[0]?.image?.imageBytes) return data.predictions[0].image.imageBytes;

  console.error("[art/generate] Unknown Imagen response:", JSON.stringify(data).slice(0, 300));
  throw new Error("No image data in Imagen response");
}
