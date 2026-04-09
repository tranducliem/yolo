/**
 * Anthropic / Claude API configuration
 *
 * Supports 3 auth methods controlled by ANALYZE_SERVICE_PROVIDER env var:
 * 1. "PROXY" — uses standalone claude-proxy server (recommended for production)
 * 2. "CLAUDE_CODE" — uses CLAUDE_CODE_OAUTH_TOKEN via claude-agent-sdk (Pro/Max subscription)
 * 3. "API" (or unset) — uses ANTHROPIC_API_KEY via direct Anthropic API (pay-per-token)
 * 4. Neither set — returns mock results
 */

export type AnalyzeProvider = "proxy" | "claude_code" | "api" | "mock";

export function getAnalyzeProvider(): AnalyzeProvider {
  const provider = process.env.ANALYZE_SERVICE_PROVIDER;

  if (provider === "PROXY" && process.env.PROXY_URL) {
    return "proxy";
  }

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

  const proxyUrl = process.env.PROXY_URL;

  return {
    apiKey,
    oauthToken,
    proxyUrl,
    hasApiKey: !!apiKey,
    hasOAuthToken: !!oauthToken,
    hasProxy: !!proxyUrl,
    isConfigured: !!apiKey || !!oauthToken || !!proxyUrl,
    provider: getAnalyzeProvider(),
  };
}
