import { NextRequest } from "next/server";
import { getPayOS } from "@/lib/payos";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderCode, amount, description, returnUrl, cancelUrl } = body ?? {};

    if (
      typeof orderCode !== "number" ||
      typeof amount !== "number" ||
      typeof description !== "string" ||
      typeof returnUrl !== "string" ||
      typeof cancelUrl !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    const payos = getPayOS();
    const res = await payos.paymentRequests.create({
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
    });
    logger.info("PayOS link created", { orderCode, amount });

    // record pending payment in Convex
    try {
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
      await convex.mutation(api.payos.createOrUpdateOrder, {
        orderCode,
        amount,
        status: "pending",
        userId: "",
      });
    } catch (e: any) {
      logger.error("Failed to record pending payment", { orderCode, error: e?.message || String(e) });
    }

    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    logger.error("PayOS create route error", { error: e?.message || String(e) });
    return new Response(JSON.stringify({ error: e?.message || "Failed to create payment link" }), { status: 500 });
  }
}

