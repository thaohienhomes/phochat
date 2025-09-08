import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/checkout/create-order
// { userId, amount, description, orderCode?, returnTo? }
// Returns: { checkoutUrl, orderId, orderCode }
export async function POST(req: NextRequest) {
  try {
    // Robust body parsing for PowerShell/curl quirks
    const contentType = req.headers.get("content-type") || "";
    const raw = await req.text();
    let body: any = {};
    if (raw) {
      if (contentType.includes("application/json")) {
        try { body = JSON.parse(raw); } catch {}
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        body = Object.fromEntries(new URLSearchParams(raw).entries());
      } else {
        try { body = JSON.parse(raw); } catch {}
      }
    }

    const { userId, description } = body ?? {};
    let amount = typeof body?.amount === "string" ? Number(body.amount) : body?.amount;
    let { orderCode, returnTo } = body ?? {};

    if (typeof userId !== "string" || !Number.isFinite(amount)) {
      logger.error("create-order invalid payload", { contentType, raw: raw?.slice(0, 200) });
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    // Generate a server-side orderCode if not provided
    if (typeof orderCode !== "number") {
      orderCode = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

    // 1) Create or reuse pending order
    const orderId = await convex.mutation(api.orders.createOrReusePending, {
      userId,
      amount,
      description,
      orderCode,
      provider: "payos",
    });
    logger.info("Order created/reused", { userId, orderCode, amount });

    // 2) Create PayOS payment link
    // Split public vs internal base URLs in dev to avoid loopback via ngrok
    const publicOrigin = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    let internalOrigin = process.env.INTERNAL_BASE_URL || new URL(req.url).origin;
    if (process.env.NODE_ENV !== "production") {
      internalOrigin = process.env.INTERNAL_BASE_URL || "http://127.0.0.1:3000";
    }

    const redirectPath = (typeof returnTo === "string" && returnTo.trim()) ? returnTo : `/orders/${orderId}`;
    const returnUrl = `${publicOrigin}/payos/return?orderCode=${orderCode}&redirect=${encodeURIComponent(redirectPath)}`;
    const cancelUrl = `${publicOrigin}/payos/return?orderCode=${orderCode}&status=cancelled&redirect=${encodeURIComponent(redirectPath)}`;

    const res = await fetch(`${internalOrigin}/api/payos/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode, amount, description, returnUrl, cancelUrl }),
    });
    const payos = await res.json();
    if (!res.ok) {
      logger.error("PayOS create failed", { orderCode, status: res.status, error: payos?.error });
      return new Response(JSON.stringify(payos), { status: res.status });
    }

    // 3) Attach checkout info
    await convex.mutation(api.orders.attachCheckoutInfo, {
      orderCode,
      paymentLinkId: payos?.paymentLinkId,
      checkoutUrl: payos?.checkoutUrl,
    });
    logger.info("Checkout link attached", { orderCode, paymentLinkId: payos?.paymentLinkId });

    return new Response(
      JSON.stringify({ checkoutUrl: payos?.checkoutUrl, orderId, orderCode }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    logger.error("create-order error", { error: e?.message || String(e) });
    return new Response(JSON.stringify({ error: e?.message || "Failed to create order" }), { status: 500 });
  }
}

// Convenience GET so you can check the route is wired via browser
export async function GET() {
  return new Response("OK (create-order expects POST)", { status: 200, headers: { "Content-Type": "text/plain" } });
}

