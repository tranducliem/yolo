import { NextRequest, NextResponse } from "next/server";
import { ART_STYLES, STYLE_FILTERS, getMockComment } from "@/lib/art-styles";

export const maxDuration = 60;

// ── Types ───────────────────────────────────────────────────────────────────

type ErrorReason = "not_configured" | "invalid_photo" | "generation_failed";
type Provider = "GOOGLE" | "GROK" | "MOCK";

interface GenerateResponse {
  success: boolean;
  mode: "generated" | "mock";
  generatedImageUrl: string | null;
  filterCSS: string;
  comment: string;
  styleId: string;
  styleName: string;
  errorReason?: ErrorReason;
}

interface ImagenPrediction {
  bytesBase64Encoded?: string;
  mimeType?: string;
  image?: { imageBytes?: string; mimeType?: string };
}

interface ImagenResponse {
  predictions?: ImagenPrediction[];
  generatedImages?: Array<{ image?: { imageBytes?: string; mimeType?: string } }>;
  error?: { code?: number; message?: string; status?: string };
}

interface GrokImageData {
  b64_json?: string;
  url?: string;
}

interface GrokResponse {
  data?: GrokImageData[];
  error?: { message?: string; type?: string };
}

interface ProxyResponse {
  success: boolean;
  result?: string;
  error?: string;
}

// ── Mock fallback (error case) ───────────────────────────────────────────────

function errorResult(
  styleId: string,
  styleName: string,
  name: string,
  errorReason: ErrorReason,
): NextResponse {
  return NextResponse.json<GenerateResponse>({
    success: true,
    mode: "mock",
    generatedImageUrl: null,
    filterCSS: STYLE_FILTERS[styleId] || "saturate(1.3) contrast(1.2)",
    comment: getMockComment(styleId, name),
    styleId,
    styleName,
    errorReason,
  });
}

// ── Route handler ───────────────────────────────────────────────────────────

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

    // Strip data URL prefix → pure base64 + mime type
    const base64Match = photo.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      console.warn("[art/generate] Invalid photo format");
      return errorResult(parsedStyleId, parsedStyleName, parsedName, "invalid_photo");
    }
    const mimeType = base64Match[1];
    const photoBase64 = base64Match[2];

    const provider = (process.env.ART_SERVICE_PROVIDER || "GOOGLE").toUpperCase() as Provider;
    console.log(`[art/generate] Provider: ${provider}`);

    // ── MOCK provider ──────────────────────────────────────────────────────
    if (provider === "MOCK") {
      const delay = 1000 + Math.random() * 1000; // 1–2s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return NextResponse.json<GenerateResponse>({
        success: true,
        mode: "mock",
        generatedImageUrl: `data:${mimeType};base64,${photoBase64}`,
        filterCSS: STYLE_FILTERS[parsedStyleId] || "",
        comment: getMockComment(parsedStyleId, parsedName),
        styleId: style.id,
        styleName: style.name,
      });
    }

    // ── GROK provider ──────────────────────────────────────────────────────
    if (provider === "GROK") {
      const grokApiKey = process.env.GROK_API_KEY;
      const grokModel = process.env.GROK_MODEL || "grok-2-image-1212";
      const grokBaseUrl = process.env.GROK_BASE_URL || "https://api.x.ai/v1";
      const grokTimeout = parseInt(process.env.GROK_TIMEOUT || "60") * 1000;

      if (!grokApiKey) {
        console.log("[art/generate] No Grok API key — returning error result");
        return errorResult(parsedStyleId, parsedStyleName, parsedName, "not_configured");
      }

      // Step 1: Describe pet (optional, best-effort)
      let petDescription = "";
      try {
        petDescription = await describePetForArt(photoBase64, mimeType, parsedName);
        console.log("[art/generate] Pet description:", petDescription.slice(0, 100));
      } catch (e) {
        console.warn("[art/generate] Pet description failed, using generic prompt:", e);
      }

      const prompt = buildGenerationPrompt(style.prompt, style.nameEn, parsedName, petDescription);
      console.log("[art/generate] Grok prompt:", prompt.slice(0, 120));

      try {
        const generatedBase64 = await generateWithGrok({
          prompt,
          apiKey: grokApiKey,
          model: grokModel,
          baseUrl: grokBaseUrl,
          timeoutMs: grokTimeout,
        });

        return NextResponse.json<GenerateResponse>({
          success: true,
          mode: "generated",
          generatedImageUrl: `data:image/jpeg;base64,${generatedBase64}`,
          filterCSS: STYLE_FILTERS[parsedStyleId] || "",
          comment: getMockComment(parsedStyleId, parsedName),
          styleId: style.id,
          styleName: style.name,
        });
      } catch (genError) {
        console.error("[art/generate] Grok generation failed:", genError);
        return errorResult(parsedStyleId, parsedStyleName, parsedName, "generation_failed");
      }
    }

    // ── GOOGLE provider (default) ──────────────────────────────────────────
    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    const googleModel = process.env.GOOGLE_AI_MODEL;
    const googleBaseUrl =
      process.env.GOOGLE_AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
    const googleRatio = process.env.GOOGLE_AI_RATIO || "1:1";
    const googleSize = process.env.GOOGLE_AI_SIZE || "2K";
    const timeoutMs = parseInt(process.env.GOOGLE_AI_TIMEOUT || "120") * 1000;

    if (!googleApiKey || !googleModel) {
      console.log("[art/generate] No Google AI config — returning error result");
      return errorResult(parsedStyleId, parsedStyleName, parsedName, "not_configured");
    }

    // Step 1: Describe pet (optional, best-effort)
    let petDescription = "";
    try {
      petDescription = await describePetForArt(photoBase64, mimeType, parsedName);
      console.log("[art/generate] Pet description:", petDescription.slice(0, 100));
    } catch (e) {
      console.warn("[art/generate] Pet description failed, using generic prompt:", e);
    }

    const prompt = buildGenerationPrompt(style.prompt, style.nameEn, parsedName, petDescription);
    console.log("[art/generate] Imagen prompt:", prompt.slice(0, 120));

    try {
      const generatedBase64 = await generateWithImagen({
        prompt,
        apiKey: googleApiKey,
        model: googleModel,
        baseUrl: googleBaseUrl,
        aspectRatio: googleRatio,
        sampleImageSize: googleSize,
        timeoutMs,
      });

      return NextResponse.json<GenerateResponse>({
        success: true,
        mode: "generated",
        generatedImageUrl: `data:image/jpeg;base64,${generatedBase64}`,
        filterCSS: STYLE_FILTERS[parsedStyleId] || "",
        comment: getMockComment(parsedStyleId, parsedName),
        styleId: style.id,
        styleName: style.name,
      });
    } catch (genError) {
      console.error("[art/generate] Imagen generation failed:", genError);
      return errorResult(parsedStyleId, parsedStyleName, parsedName, "generation_failed");
    }
  } catch (error: unknown) {
    console.error("[art/generate] Error:", error);
    return errorResult(parsedStyleId, parsedStyleName, parsedName, "generation_failed");
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

  const data = (await response.json()) as ProxyResponse;
  if (!data.success) throw new Error(`Proxy error: ${data.error}`);

  return (data.result || "").trim().slice(0, 300);
}

// ── Step 2: Build generation prompt ─────────────────────────────────────────

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

// ── Google Imagen ────────────────────────────────────────────────────────────

interface ImagenGenerateParams {
  prompt: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  aspectRatio: string;
  sampleImageSize: string;
  timeoutMs: number;
}

async function generateWithImagen(params: ImagenGenerateParams): Promise<string> {
  const { prompt, apiKey, model, baseUrl, aspectRatio, sampleImageSize, timeoutMs } = params;
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
        aspectRatio,
        sampleImageSize,
      },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[art/generate] Imagen API error:", response.status, errText.slice(0, 300));
    throw new Error(`Imagen API ${response.status}`);
  }

  const data = (await response.json()) as ImagenResponse;

  const generatedImageBytes = data.generatedImages?.[0]?.image?.imageBytes;
  if (generatedImageBytes) return generatedImageBytes;

  const predictionBase64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (predictionBase64) return predictionBase64;

  const predictionImageBytes = data.predictions?.[0]?.image?.imageBytes;
  if (predictionImageBytes) return predictionImageBytes;

  console.error("[art/generate] Unknown Imagen response:", JSON.stringify(data).slice(0, 300));
  throw new Error("No image data in Imagen response");
}

// ── Grok (xAI) image generation ──────────────────────────────────────────────

interface GrokGenerateParams {
  prompt: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs: number;
}

async function generateWithGrok(params: GrokGenerateParams): Promise<string> {
  const { prompt, apiKey, model, baseUrl, timeoutMs } = params;
  const url = `${baseUrl}/images/generations`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      response_format: "b64_json",
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[art/generate] Grok API error:", response.status, errText.slice(0, 300));
    throw new Error(`Grok API ${response.status}`);
  }

  const data = (await response.json()) as GrokResponse;

  const b64 = data.data?.[0]?.b64_json;
  if (b64) return b64;

  console.error("[art/generate] Unknown Grok response:", JSON.stringify(data).slice(0, 300));
  throw new Error("No image data in Grok response");
}
