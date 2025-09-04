export const ALLOWED_MODELS = ["gpt-4o-mini", "gpt-4o", "o3-mini"] as const;
export type AllowedModel = typeof ALLOWED_MODELS[number];

