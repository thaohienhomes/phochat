import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/admin/reconcile/run { olderThanMs?: number }
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Optional allowlist guard via env ADMIN_USER_IDS (comma-separated Clerk userIds)
    const allow = (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (allow.length > 0 && !allow.includes(userId)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const olderThanMs = typeof body?.olderThanMs === "number" ? body.olderThanMs : 15 * 60 * 1000;

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
    if (!convexUrl) {
      return new Response(JSON.stringify({ error: "Convex URL not configured" }), { status: 500 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    const result = await convex.action(api.reconcile.reconcilePending, { olderThanMs });

    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Reconcile run failed" }), { status: 500 });
  }
}

