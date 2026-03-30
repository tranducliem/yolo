/**
 * Anthropic / Claude API configuration
 *
 * Supports 2 auth methods controlled by ANALYZE_SERVICE_PROVIDER env var:
 * 1. "CLAUDE_CODE" — uses CLAUDE_CODE_OAUTH_TOKEN via claude-agent-sdk (Pro/Max subscription)
 * 2. "API" (or unset) — uses ANTHROPIC_API_KEY via direct Anthropic API (pay-per-token)
 * 3. Neither set — returns mock results
 */

export type AnalyzeProvider = "claude_code" | "api" | "mock";

export function getAnalyzeProvider(): AnalyzeProvider {
  const provider = process.env.ANALYZE_SERVICE_PROVIDER;

  if (provider === "CLAUDE_CODE" && process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    return "claude_code";
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return "api";
  }

  return "mock";
}

export function getAnthropicConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const oauthToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;

  return {
    apiKey,
    oauthToken,
    hasApiKey: !!apiKey,
    hasOAuthToken: !!oauthToken,
    isConfigured: !!apiKey || !!oauthToken,
    provider: getAnalyzeProvider(),
  };
}
