export function normalizeAIGatewayBaseURL(raw?: string | null) {
  if (!raw) return undefined;
  let u = raw.trim();
  // remove trailing slashes
  u = u.replace(/\/+$/, "");
  // strip provider suffixes like /openai, /anthropic, etc., if present
  u = u.replace(/\/(openai|anthropic|google|groq|mistral|perplexity|together|deepseek|fireworks)$/i, "");
  return u;
}

export function getAIBaseURL() {
  const raw =
    process.env.AI_GATEWAY_BASE_URL ||
    process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL ||
    "https://ai-gateway.vercel.sh/v1";
  return normalizeAIGatewayBaseURL(raw);
}

export function getAIKey() {
  return process.env.AI_GATEWAY_KEY || process.env.NEXT_PUBLIC_AI_GATEWAY_KEY;
}
