import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/create-order
// { userId, amount, description, orderCode?, returnTo? }
// Returns: { checkoutUrl, orderId, orderCode }
export async function POST(req: NextRequest) {
  try {
    console.log("[create-order] handler start");
    const body = await req.json();
    const { userId, amount, description } = body ?? {};
    let { orderCode, returnTo } = body ?? {};

    if (typeof userId !== "string" || typeof amount !== "number") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    if (typeof orderCode !== "number") {
      orderCode = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
    }

    console.log("[create-order] parsed body", { userId, amount });
    logger.info("[create-order] init", { userId, amount });
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    logger.info("[create-order] calling createOrReusePending", { orderCode });
    const orderId = await convex.mutation(api.orders.createOrReusePending, {
      userId,
      amount,
      description,
      orderCode,
      provider: "payos",
    });


    // 2) Create PayOS payment link
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const redirectPath = (typeof returnTo === "string" && returnTo.trim()) ? returnTo : `/orders/${orderId}`;
    const returnUrl = `${origin}/payos/return?orderCode=${orderCode}&redirect=${encodeURIComponent(redirectPath)}`;
    const cancelUrl = `${origin}/payos/return?orderCode=${orderCode}&status=cancelled&redirect=${encodeURIComponent(redirectPath)}`;

    logger.info("[create-order] calling payos/create", { orderCode, returnUrl });
    const res = await fetch(`${origin}/api/payos/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode, amount, description, returnUrl, cancelUrl }),
    });
    const payos = await res.json();
    if (!res.ok) {
      logger.error("PayOS create failed", { orderCode, status: res.status, error: (payos as any)?.error });
      return new Response(JSON.stringify(payos), { status: res.status });
    }

    // 3) Attach checkout info
    logger.info("[create-order] attaching checkout info", { orderCode });
    await convex.mutation(api.orders.attachCheckoutInfo, {
      orderCode,
      paymentLinkId: (payos as any)?.paymentLinkId,
      checkoutUrl: (payos as any)?.checkoutUrl,
    });
    logger.info("Checkout link attached", { orderCode, paymentLinkId: (payos as any)?.paymentLinkId });

    return new Response(
      JSON.stringify({ checkoutUrl: (payos as any)?.checkoutUrl, orderId, orderCode }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    logger.error("create-order failed", { error: e?.message || String(e) });
    return new Response(JSON.stringify({ error: e?.message || "Failed to create order" }), { status: 500 });
  }
}

