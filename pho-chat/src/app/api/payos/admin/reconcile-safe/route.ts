import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { auth, clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/payos/admin/reconcile-safe { olderThanMs?: number }
// Server-side admin guard using Clerk; calls Convex action directly.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const cc = await clerkClient();
    const user = await cc.users.getUser(userId);
    const role = (user?.publicMetadata as any)?.role;
    if (role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const olderThanMs = typeof body?.olderThanMs === "number" ? body.olderThanMs : 15 * 60 * 1000;

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    const result = await convex.action(api.reconcile.reconcilePending, { olderThanMs });
    try { Sentry.captureMessage("reconcile-safe manual run", { level: "info", extra: { userId, olderThanMs, count: result?.count } }); } catch {}
    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    try { Sentry.captureException(e); } catch {}
    return new Response(JSON.stringify({ error: e?.message || "Reconcile failed" }), { status: 500 });
  }
}

export async function GET() {
  return new Response("OK (reconcile-safe expects POST)", { status: 200, headers: { "Content-Type": "text/plain" } });
}

