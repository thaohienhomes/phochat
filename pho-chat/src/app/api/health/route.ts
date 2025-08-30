import { NextResponse } from "next/server";
import { getAIBaseURL, getAIKey } from "@/lib/aiConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AI_BASE = getAIBaseURL()!; // aiConfig ensures canonical form (no provider suffix)
const AI_KEY = getAIKey();

function redact(token?: string | null) {
  if (!token) return null;
  if (token.length <= 8) return "***";
  return token.slice(0, 3) + "***" + token.slice(-4);
}

export async function GET() {
  const startedAt = Date.now();

  // Check env presence
  const env = {
    AI_GATEWAY_BASE_URL: Boolean(process.env.AI_GATEWAY_BASE_URL),
    NEXT_PUBLIC_AI_GATEWAY_BASE_URL: Boolean(process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL),
    AI_GATEWAY_KEY: Boolean(process.env.AI_GATEWAY_KEY),
    NEXT_PUBLIC_AI_GATEWAY_KEY: Boolean(process.env.NEXT_PUBLIC_AI_GATEWAY_KEY),
  };

  // Try a lightweight connectivity probe to the gateway
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  let connectivity: {
    url: string;
    ok: boolean;
    status?: number;
    error?: string;
  } = { url: `${AI_BASE.replace(/\/$/, "")}/models`, ok: false };

  try {
    const resp = await fetch(connectivity.url, {
      headers: AI_KEY ? { Authorization: `Bearer ${AI_KEY}` } : {},
      cache: "no-store",
      signal: controller.signal,
    });
    connectivity = { url: connectivity.url, ok: resp.ok, status: resp.status };
  } catch (e: any) {
    connectivity = { url: connectivity.url, ok: false, error: e?.message || String(e) };
  } finally {
    clearTimeout(timeout);
  }

  const payload = {
    ok: true,
    now: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    env,
    configuredBaseURL: AI_BASE,
    keyPreview: redact(AI_KEY),
    connectivity,
  };

  return NextResponse.json(payload);
}
