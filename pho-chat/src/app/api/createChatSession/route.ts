import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
// Basic model allowlist
const ALLOWED_MODELS = new Set(["gpt-4o-mini", "gpt-4o", "o3-mini"]);
export const dynamic = "force-dynamic";

// CORS: default to same-origin. Allow an explicit allowlist via env ALLOWED_ORIGINS (comma-separated).
function buildCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let allowOrigin = "";
  if (!origin) {
    // Non-CORS requests (same-origin) or server-side calls
    allowOrigin = ""; // no header needed
  } else if (allowed.length && allowed.includes(origin)) {
    allowOrigin = origin;
  } else {
    // Deny cross-origin by default
    allowOrigin = "";
  }

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Vercel-Protection-Bypass, X-Vercel-Bypass-Token",
  };
  if (allowOrigin) headers["Access-Control-Allow-Origin"] = allowOrigin;
  return headers;
}

export async function OPTIONS(req: Request) {
  // Respond to preflight with computed CORS headers
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(req) });
}

export async function POST(req: Request) {
  try {

    const { model } = (await req.json()) as { model?: string };
    if (!model) {
      return NextResponse.json({ error: "Missing model" }, { status: 400, headers: buildCorsHeaders(req) });
    }
    // Require authentication via Clerk middleware on the route handler
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: buildCorsHeaders(req) });
    }
    if (!ALLOWED_MODELS.has(model)) {
      return NextResponse.json({ error: "Unsupported model" }, { status: 400, headers: buildCorsHeaders(req) });
    }
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://beloved-hyena-231.convex.cloud";
    const client = new ConvexHttpClient(url);
    const id = await client.mutation(api.functions.createChatSession.createChatSession, { model });

    return NextResponse.json({ id }, { status: 200, headers: buildCorsHeaders(req) });
  } catch (err: any) {
    // Provide lightweight diagnostics to debug Preview failures; does not include secrets.
    const msg = err?.message || String(err);
    const stack = typeof err?.stack === 'string' ? err.stack.split('\n')[0] : undefined;
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://beloved-hyena-231.convex.cloud";
    const detail = (err?.data ? { data: err.data } : {});
    return NextResponse.json(
      { error: "Convex call failed", message: msg, stack, url, ...detail },
      { status: 500, headers: buildCorsHeaders(req) }
    );
  }
}

