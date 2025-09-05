import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/payos/admin/reconcile { olderThanMs?: number }
export async function POST(req: NextRequest) {
  try {
    // Simple admin guard via shared secret; optionally support query param for manual calls
    const provided = req.headers.get("x-admin-token") || req.nextUrl.searchParams.get("token");
    const expected = process.env.ADMIN_RECONCILE_TOKEN;
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const olderThanMs = typeof body?.olderThanMs === "number" ? body.olderThanMs : 15 * 60 * 1000;

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    const result = await convex.action(api.reconcile.reconcilePending, { olderThanMs });

    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Reconcile failed" }), { status: 500 });
  }
}

