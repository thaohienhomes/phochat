import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sessionId, content } = (await req.json()) as { sessionId?: any; content?: string };
    if (!sessionId || !content) {
      return NextResponse.json({ error: "Missing sessionId or content" }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "";
    const client = new ConvexHttpClient(url);
    const msg = { id: String(Date.now()), role: "user", content, createdAt: Date.now() };
    const res = await client.mutation(api.functions.sendMessage.sendMessage, { sessionId: sessionId as any, message: msg });
    return NextResponse.json({ ok: true, res }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

