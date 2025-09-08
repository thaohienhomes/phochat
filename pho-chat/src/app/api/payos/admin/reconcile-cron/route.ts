import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const expectedA = process.env.ADMIN_RECONCILE_TOKEN || "";
  const expectedB = process.env.CRON_SECRET || ""; // Vercel Cron injects Authorization: Bearer <CRON_SECRET>
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const headerToken = req.headers.get("x-admin-token") || "";
  const queryToken = req.nextUrl.searchParams.get("token") || "";
  const matches = (t: string) => t && (t === expectedA || t === expectedB);
  return matches(bearer) || matches(headerToken) || matches(queryToken);
}

// POST /api/payos/admin/reconcile-cron
// Intended for scheduled invocation (e.g., Vercel Cron)
export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const olderThanMs = 15 * 60 * 1000; // 15 minutes default
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    const result = await convex.action(api.reconcile.reconcilePending, { olderThanMs });
    try { Sentry.captureMessage("reconcile-cron POST run", { level: "info", extra: { olderThanMs, count: result?.count } }); } catch {}
    return new Response(JSON.stringify({ ok: true, ...result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    try { Sentry.captureException(e); } catch {}
    return new Response(JSON.stringify({ error: e?.message || "Reconcile cron failed" }), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const olderThanParam = req.nextUrl.searchParams.get("olderThanMs");
    const olderThanMs = olderThanParam ? Number(olderThanParam) : 15 * 60 * 1000;

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    const result = await convex.action(api.reconcile.reconcilePending, { olderThanMs });
    try { Sentry.captureMessage("reconcile-cron GET run", { level: "info", extra: { olderThanMs, count: result?.count } }); } catch {}
    return new Response(JSON.stringify({ ok: true, ...result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    try { Sentry.captureException(e); } catch {}
    return new Response(JSON.stringify({ error: e?.message || "Reconcile cron failed" }), { status: 500 });
  }
}
