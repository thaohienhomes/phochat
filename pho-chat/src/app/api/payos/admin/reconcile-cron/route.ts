import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/payos/admin/reconcile-cron
// Intended for scheduled invocation (e.g., Vercel Cron)
// Auth: same header as manual reconcile: x-admin-token: ADMIN_RECONCILE_TOKEN
export async function POST(req: NextRequest) {
  try {
    const provided = req.headers.get("x-admin-token") || req.nextUrl.searchParams.get("token");
    const expected = process.env.ADMIN_RECONCILE_TOKEN;
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const olderThanMs = 15 * 60 * 1000; // 15 minutes default
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    const result = await convex.action(api.reconcile.reconcilePending, { olderThanMs });
    return new Response(JSON.stringify({ ok: true, ...result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Reconcile cron failed" }), { status: 500 });
  }
}

export async function GET() {
  return new Response("OK (reconcile-cron expects POST)", { status: 200, headers: { "Content-Type": "text/plain" } });
}

