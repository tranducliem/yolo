import { NextRequest, NextResponse } from "next/server";
import { analyzeWithClaude, generateMockResults } from "@/lib/analyze";
import type { AnalyzeRequest } from "@/types";
import { LIMITS } from "@/config/site";

export const maxDuration = 60; // Vercel timeout (seconds)

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { photos, petName } = body;

    if (!photos || photos.length < LIMITS.minPhotosPerAnalysis) {
      return NextResponse.json(
        { success: false, error: "No photos provided" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.log("No ANTHROPIC_API_KEY — returning mock results");
      return NextResponse.json({
        success: true,
        mode: "mock",
        results: generateMockResults(photos.length, petName || "ペット"),
      });
    }

    const results = await analyzeWithClaude(photos, petName || "ペット", apiKey);

    return NextResponse.json({
      success: true,
      mode: "live",
      results,
    });
  } catch (error: unknown) {
    console.error("Analyze error:", error);
    return NextResponse.json({
      success: true,
      mode: "mock",
      results: generateMockResults(5, "ペット"),
    });
  }
}
