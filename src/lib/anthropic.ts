/**
 * Anthropic / Claude API configuration
 *
 * Hỗ trợ 2 phương thức:
 * 1. ANTHROPIC_API_KEY — pay-per-token (đắt)
 * 2. CLAUDE_CODE_OAUTH_TOKEN — Pro/Max subscription (rẻ, qua claude-agent-sdk)
 */

export function getAnthropicConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const oauthToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;

  return {
    apiKey,
    oauthToken,
    hasApiKey: !!apiKey,
    hasOAuthToken: !!oauthToken,
    isConfigured: !!apiKey || !!oauthToken,
  };
}
