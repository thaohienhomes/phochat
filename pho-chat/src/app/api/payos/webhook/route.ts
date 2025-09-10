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
    const contentType = (req.headers.get('content-type') || '').toLowerCase();
    let raw = '';
    try {
      raw = await req.text();
    } catch (err: any) {
      logger.info('Webhook body read failed; treating as healthcheck', { error: err?.message || String(err) });
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (!raw?.trim() || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    let body: any;
    try {
      body = JSON.parse(raw);
    } catch (err: any) {
      logger.info('Webhook JSON parse failed; treating as healthcheck', { error: err?.message || String(err) });
      return new Response(JSON.stringify({ ok: true, healthcheck: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    const payos = getPayOS();
    let verified: any;
    try {
      verified = await payos.webhooks.verify(body as any);
    } catch (err: any) {
      logger.info("Webhook verification failed", { level: "warn", error: err?.message || String(err) });
      return new Response(
        JSON.stringify({ ok: true, ignored: true, reason: "invalid signature or payload" }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    }

    if (!verified?.orderCode) {
      return new Response(
        JSON.stringify({ ok: true, ignored: true, reason: "missing orderCode" }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      logger.warn?.("Convex URL missing; acknowledging webhook without DB update", { orderCode: verified.orderCode });
      return new Response(JSON.stringify({ received: true, noDb: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    try {
      const convex = new ConvexHttpClient(convexUrl);

      // Idempotency: record event first; if already processed, exit early
      const eventHash = stableHash({ orderCode: verified.orderCode, code: verified.code, id: (verified as any)?.id });
      const isNew = await convex.mutation(api.orders.recordEventIfNew, {
        eventHash,
        orderCode: verified.orderCode,
        payload: verified,
      });
      if (!isNew) {
        logger.info("Webhook duplicate event", { orderCode: verified.orderCode, eventHash });
        return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      // Update order status based on webhook
      const status = deriveOrderStatus(verified as any);
      await convex.mutation(api.orders.setStatusByOrderCode, { orderCode: verified.orderCode, status });
      logger.info("Order status updated from webhook", { orderCode: verified.orderCode, status });

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    } catch (err: any) {
      logger.error?.("Convex update failed; acknowledging webhook", { orderCode: verified.orderCode, error: err?.message || String(err) });
      return new Response(JSON.stringify({ received: true, dbError: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
  } catch (e: any) {
    logger.error("Webhook error", { error: e?.message || String(e) });
    return new Response(JSON.stringify({ error: e?.message || "Webhook error" }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, healthcheck: true, method: 'GET' }), { status: 200, headers: { 'content-type': 'application/json' } });
}

export async function HEAD() {
  return new Response(null, { status: 200, headers: { 'content-type': 'application/json' } });
}
