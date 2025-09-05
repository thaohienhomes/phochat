import { NextRequest } from "next/server";
import { getPayOS } from "@/lib/payos";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { logger } from "@/lib/logger";
import { stableHash, deriveOrderStatus } from "@/lib/payosWebhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payos = getPayOS();
    const verified = await payos.webhooks.verify(body as any);

    if (!verified?.orderCode) {
      return new Response(JSON.stringify({ error: "Invalid webhook data" }), { status: 400 });
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

    // Idempotency: record event first; if already processed, exit early
    const eventHash = stableHash({ orderCode: verified.orderCode, code: verified.code, id: (verified as any)?.id });
    const isNew = await convex.mutation(api.orders.recordEventIfNew, {
      eventHash,
      orderCode: verified.orderCode,
      payload: verified,
    });
    if (!isNew) {
      logger.info("Webhook duplicate event", { orderCode: verified.orderCode, eventHash });
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    // Update order status based on webhook
    const status = deriveOrderStatus(verified as any);
    await convex.mutation(api.orders.setStatusByOrderCode, { orderCode: verified.orderCode, status });
    logger.info("Order status updated from webhook", { orderCode: verified.orderCode, status });

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e: any) {
    logger.error("Webhook error", { error: e?.message || String(e) });
    return new Response(JSON.stringify({ error: e?.message || "Webhook error" }), { status: 500 });
  }
}

