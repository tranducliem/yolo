import { NextRequest, NextResponse } from "next/server";
import { analyzeWithClaude, analyzeWithClaudeAgentSDK, generateMockResults } from "@/lib/analyze";
import { getAnalyzeProvider } from "@/lib/anthropic";
import type { AnalyzeRequest } from "@/types";
import { LIMITS } from "@/config/site";

export const maxDuration = 60; // Vercel timeout (seconds)

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { photos, petName } = body;

    if (!photos || photos.length < LIMITS.minPhotosPerAnalysis) {
      return NextResponse.json({ success: false, error: "No photos provided" }, { status: 400 });
    }

    const provider = getAnalyzeProvider();
    console.log(`[analyze] Provider: ${provider}, Photos: ${photos.length}`);

    // Method 1: Claude Agent SDK (OAuth token — Pro/Max subscription)
    if (provider === "claude_code") {
      try {
        const results = await analyzeWithClaudeAgentSDK(photos, petName || "ペット");
        return NextResponse.json({ success: true, mode: "live", results });
      } catch (error) {
        console.error("[analyze] Agent SDK error, falling back to mock:", error);
        return NextResponse.json({
          success: true,
          mode: "mock",
          results: generateMockResults(photos.length, petName || "ペット"),
        });
      }
    }

    // Method 2: Direct Anthropic API (API key — pay-per-token)
    if (provider === "api") {
      try {
        const results = await analyzeWithClaude(
          photos,
          petName || "ペット",
          process.env.ANTHROPIC_API_KEY!,
        );
        return NextResponse.json({ success: true, mode: "live", results });
      } catch (error) {
        console.error("[analyze] API error, falling back to mock:", error);
        return NextResponse.json({
          success: true,
          mode: "mock",
          results: generateMockResults(photos.length, petName || "ペット"),
        });
      }
    }

    // Method 3: Mock fallback (no credentials configured)
    console.log("[analyze] No credentials — returning mock results");
    return NextResponse.json({
      success: true,
      mode: "mock",
      results: generateMockResults(photos.length, petName || "ペット"),
    });
  } catch (error: unknown) {
    console.error("[analyze] Unexpected error:", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
