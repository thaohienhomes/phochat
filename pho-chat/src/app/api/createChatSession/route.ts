import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Basic CORS helpers to allow cross-origin calls during verification/diagnostics.
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Vercel-Protection-Bypass, X-Vercel-Bypass-Token",
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  try {
    const { userId, model } = (await req.json()) as { userId?: string; model?: string };
    if (!userId || !model) {
      return NextResponse.json({ error: "Missing userId or model" }, { status: 400, headers: corsHeaders() });
    }
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://clean-ox-220.convex.cloud";
    const client = new ConvexHttpClient(url);
    const id = await client.mutation(api.functions.createChatSession, { userId, model });
    return NextResponse.json({ id }, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    // Provide lightweight diagnostics to debug Preview failures; does not include secrets.
    const msg = err?.message || String(err);
    const stack = typeof err?.stack === 'string' ? err.stack.split('\n')[0] : undefined;
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://clean-ox-220.convex.cloud";
    const detail = (err?.data ? { data: err.data } : {});
    return NextResponse.json(
      { error: "Convex call failed", message: msg, stack, url, ...detail },
      { status: 500, headers: corsHeaders() }
    );
  }
}

