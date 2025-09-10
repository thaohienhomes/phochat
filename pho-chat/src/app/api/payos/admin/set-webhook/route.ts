import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getPayOS } from "../../../../../lib/payos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/payos/admin/set-webhook { url: string }
// Auth: Prefer Authorization: Bearer CRON_SECRET or x-admin-token: ADMIN_RECONCILE_TOKEN.
// In non-production, if no secrets are set, allow for local setup convenience.
export async function POST(req: NextRequest) {
  try {
    const authz = req.headers.get("authorization") || "";
    const bearer = authz.startsWith("Bearer ") ? authz.slice("Bearer ".length) : undefined;
    const adminTokenHeader = req.headers.get("x-admin-token") || undefined;

    const cronSecret = process.env.CRON_SECRET;
    const adminToken = process.env.ADMIN_RECONCILE_TOKEN;

    const isDev = process.env.NODE_ENV !== "production";
    const authed = (cronSecret && bearer === cronSecret) || (adminToken && adminTokenHeader === adminToken) || isDev;
    if (!authed) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const url = (body?.url as string) || new URL(req.url).searchParams.get("url") || "";
    if (!url) {
      return new Response(JSON.stringify({ error: "Missing url" }), { status: 400 });
    }

    const payos = getPayOS() as any;
    let result: any;
    if (payos?.webhooks?.confirm) {
      result = await payos.webhooks.confirm(url);
    } else if (typeof payos?.confirmWebhook === "function") {
      result = await payos.confirmWebhook(url);
    } else {
      throw new Error("SDK does not support webhook confirmation on this version");
    }
    try { Sentry.captureMessage("PayOS webhook URL confirmed", { level: "info", extra: { url, result } }); } catch {}

    return new Response(JSON.stringify({ ok: true, url, result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    try { Sentry.captureException(e); } catch {}
    const msg = e?.message || "Failed to set webhook";
    const stack = e?.stack || undefined;
    console.error("[PayOS] set-webhook error", msg, stack);
    return new Response(JSON.stringify({ error: msg, stack }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

