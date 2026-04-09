import { NextRequest, NextResponse } from "next/server";
import {
  analyzeWithClaude,
  analyzeWithClaudeAgentSDK,
  analyzeWithProxy,
  generateMockResults,
} from "@/lib/analyze";
import { getAnalyzeProvider } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AnalyzeRequest, AnalyzeResult } from "@/types";
import { LIMITS } from "@/config/site";

export const maxDuration = 60;

// Per-plan bestshot limits
const PLAN_BESTSHOT_LIMITS: Record<string, number> = {
  free: 3,
  plus: 10,
  pro: 30,
  family: Infinity,
};

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { photos, petName } = body;

    if (!photos || photos.length < LIMITS.minPhotosPerAnalysis) {
      return NextResponse.json({ success: false, error: "No photos provided" }, { status: 400 });
    }

    // Check auth (optional — anonymous users can analyze once)
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let userId: string | null = null;
    let petId: string | null = null;
    let userPlan = "free";

    if (authUser) {
      const { data: profile } = await supabaseAdmin
        .from("users")
        .select("id, plan, bestshot_count_this_month, bestshot_count_reset_month")
        .eq("auth_id", authUser.id)
        .single();

      if (profile) {
        userId = profile.id;
        userPlan = profile.plan;

        // Lazy monthly reset
        const currentMonth = new Date().getFullYear() * 100 + (new Date().getMonth() + 1);
        if (profile.bestshot_count_reset_month < currentMonth) {
          await supabaseAdmin
            .from("users")
            .update({
              bestshot_count_this_month: 0,
              bestshot_count_reset_month: currentMonth,
            })
            .eq("id", profile.id);
          profile.bestshot_count_this_month = 0;
        }

        // Check quota
        const limit = PLAN_BESTSHOT_LIMITS[userPlan] ?? 3;
        if (limit !== Infinity && profile.bestshot_count_this_month >= limit) {
          return NextResponse.json({
            success: false,
            error: "limit_reached",
            currentCount: profile.bestshot_count_this_month,
            limit,
            plan_required: userPlan === "free" ? "plus" : "pro",
          });
        }

        // Get first pet
        const { data: pet } = await supabaseAdmin
          .from("pets")
          .select("id")
          .eq("user_id", profile.id)
          .limit(1)
          .single();
        if (pet) petId = pet.id;
      }
    }

    const provider = getAnalyzeProvider();
    console.log(
      `[analyze] Provider: ${provider}, Photos: ${photos.length}, User: ${userId || "anonymous"}`,
    );

    let results: AnalyzeResult[];
    let mode: "live" | "mock";

    // Run analysis
    if (provider === "proxy") {
      try {
        results = await analyzeWithProxy(photos, petName || "ペット");
        mode = "live";
      } catch (error) {
        console.error("[analyze] Proxy error, falling back to mock:", error);
        results = generateMockResults(photos.length, petName || "ペット");
        mode = "mock";
      }
    } else if (provider === "claude_code") {
      try {
        results = await analyzeWithClaudeAgentSDK(photos, petName || "ペット");
        mode = "live";
      } catch (error) {
        console.error("[analyze] Agent SDK error, falling back to mock:", error);
        results = generateMockResults(photos.length, petName || "ペット");
        mode = "mock";
      }
    } else if (provider === "api") {
      try {
        results = await analyzeWithClaude(
          photos,
          petName || "ペット",
          process.env.ANTHROPIC_API_KEY!,
        );
        mode = "live";
      } catch (error) {
        console.error("[analyze] API error, falling back to mock:", error);
        results = generateMockResults(photos.length, petName || "ペット");
        mode = "mock";
      }
    } else {
      results = generateMockResults(photos.length, petName || "ペット");
      mode = "mock";
    }

    // Save bestshots to DB (for authenticated users with live results)
    let batchId: string | null = null;
    if (userId && mode === "live") {
      batchId = crypto.randomUUID();

      const bestshotRows = results.map((r, i) => ({
        user_id: userId!,
        pet_id: petId!,
        photo_url: `analysis/${batchId}/${i}`, // Placeholder — real URL when Storage upload is added
        total_score: r.totalScore,
        quality_score: r.qualityScore,
        expression_score: r.expressionScore,
        preference_score: r.preferenceScore,
        smile_rating: r.smileRating,
        love_rating: r.loveRating,
        rare_rating: r.rareRating,
        ai_comment: r.aiComment,
        rank: i + 1,
        analysis_mode: mode,
        analysis_batch_id: batchId,
      }));

      const { error: insertError } = await supabaseAdmin.from("bestshots").insert(bestshotRows);

      if (insertError) {
        console.error("[analyze] Failed to save bestshots:", insertError.message);
      } else {
        // Increment usage counter
        const { data: current } = await supabaseAdmin
          .from("users")
          .select("bestshot_count_this_month")
          .eq("id", userId!)
          .single();
        if (current) {
          await supabaseAdmin
            .from("users")
            .update({
              bestshot_count_this_month: current.bestshot_count_this_month + 1,
            })
            .eq("id", userId!);
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      batchId,
      results,
    });
  } catch (error: unknown) {
    console.error("[analyze] Unexpected error:", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
