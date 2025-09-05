import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/payos/status?orderCode=123
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const oc = url.searchParams.get("orderCode");
    const orderCode = oc ? Number(oc) : NaN;
    if (!Number.isFinite(orderCode)) {
      return new Response(JSON.stringify({ error: "Invalid orderCode" }), { status: 400 });
    }
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    const res = await convex.query(api.orders.statusByOrderCode, { orderCode });
    logger.info("Status polled", { orderCode, status: (res as any)?.status });
    return new Response(JSON.stringify(res), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    logger.error("Status route error", { error: e?.message || String(e) });
    return new Response(JSON.stringify({ error: e?.message || "Failed to fetch" }), { status: 500 });
  }
}

