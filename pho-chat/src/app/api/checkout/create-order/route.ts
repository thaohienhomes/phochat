import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { getPayOS } from "@/lib/payos";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function genOrderCode(): number {
  // Generate a 15-digit-ish numeric code within JS safe range
  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000);
  // e.g. seconds since epoch * 1000 + random (keeps it <= ~13 digits)
  return Math.floor(now / 1000) * 1000 + rand;
}

function baseUrlFrom(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const proto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, description } = await req.json();

    if (typeof amount !== "number" || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    const user = typeof userId === "string" ? userId : "guest";
    const orderCode = genOrderCode();

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    // Create or reuse a pending order in our DB first
    const orderId = await convex.mutation(api.orders.createOrReusePending, {
      userId: user,
      amount,
      currency: "VND",
      description: typeof description === "string" ? description : undefined,
      orderCode,
      provider: "payos",
      metadata: undefined,
    });

    const appBase = baseUrlFrom(req);
    const redirectPath = `/orders/${orderId}`;
    const returnUrl = `${appBase}/payos/return?orderCode=${orderCode}&redirect=${encodeURIComponent(redirectPath)}`;
    const cancelUrl = `${appBase}${redirectPath}`;

    const payos = getPayOS();
    const res = await payos.paymentRequests.create({
      orderCode,
      amount,
      description: typeof description === "string" ? description : `Order ${orderCode}`,
      returnUrl,
      cancelUrl,
    } as any);

    const checkoutUrl = (res as any)?.checkoutUrl || (res as any)?.data?.checkoutUrl || "";
    const paymentLinkId = (res as any)?.paymentLinkId || (res as any)?.data?.paymentLinkId;

    try {
      await convex.mutation(api.orders.attachCheckoutInfo, {
        orderCode,
        paymentLinkId,
        checkoutUrl,
      });
    } catch (e: any) {
      logger.error("Failed to attach checkout info", { orderCode, error: e?.message || String(e) });
    }

    logger.info("Order created & PayOS link generated", { orderCode, amount });

    return new Response(
      JSON.stringify({ orderId, orderCode, checkoutUrl, redirect: redirectPath }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    logger.error("create-order error", { error: e?.message || String(e) });
    return new Response(
      JSON.stringify({ error: e?.message || "Failed to create order" }),
      { status: 500 }
    );
  }
}

