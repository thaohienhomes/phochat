export const ALLOWED_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "o3-mini",
  // Anthropic via AI Gateway (OpenAI-compatible endpoint)
  "claude-3-haiku",
  "claude-3-sonnet",
  "claude-3-5-sonnet-latest",
] as const;
export type AllowedModel = (typeof ALLOWED_MODELS)[number];
