import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, model } = (await req.json()) as { userId?: string; model?: string };
    if (!userId || !model) {
      return NextResponse.json({ error: "Missing userId or model" }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://clean-ox-220.convex.cloud";
    const client = new ConvexHttpClient(url);
    const id = await client.mutation(api.functions.createChatSession, { userId, model });
    return NextResponse.json({ id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Convex call failed", message: err?.message || String(err) }, { status: 500 });
  }
}

