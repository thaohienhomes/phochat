import { NextResponse } from "next/server";
import { getAIBaseURL, getAIKey } from "@/lib/aiConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const apiKey = getAIKey();
const baseURL = getAIBaseURL();


export async function GET() {
  try {
    const resp = await fetch(`${(baseURL?.replace(/\/$/, "")) || "https://ai-gateway.vercel.sh/v1"}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      cache: "no-store",
    });
    const text = await resp.text();
    return NextResponse.json({ ok: resp.ok, status: resp.status, preview: text.slice(0, 200) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { model = "gpt-4o-mini", prompt = "Say hello in one short sentence." } = await req.json();
    const resp = await fetch(`${(baseURL?.replace(/\/$/, "")) || "https://ai-gateway.vercel.sh/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await resp.json().catch(() => null);
    return NextResponse.json({ ok: resp.ok, status: resp.status, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
export async function HEAD() {
  // Provide a quick success response for monitoring
  return new Response(null, { status: 200 });
}
