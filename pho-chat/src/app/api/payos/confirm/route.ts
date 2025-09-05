import { NextRequest } from "next/server";
import { getPayOS } from "@/lib/payos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/payos/confirm
// Body: { webhookUrl: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const webhookUrl = body?.webhookUrl as string | undefined;
    if (!webhookUrl || typeof webhookUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing webhookUrl" }), { status: 400 });
    }

    const payos = getPayOS();
    const res = await payos.webhooks.confirm(webhookUrl);
    return new Response(JSON.stringify({ ok: true, res }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed to confirm webhook" }), { status: 500 });
  }
}

