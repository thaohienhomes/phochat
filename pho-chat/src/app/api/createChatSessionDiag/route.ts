import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://clean-ox-220.convex.cloud";
    return NextResponse.json({ ok: true, url, payload }, { status: 200 });
  } catch (err: any) {
    const msg = err?.message || String(err);
    const stack = typeof err?.stack === 'string' ? err.stack.split('\n')[0] : undefined;
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://clean-ox-220.convex.cloud";
    return NextResponse.json({ ok: false, message: msg, stack, url }, { status: 500 });
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://clean-ox-220.convex.cloud";
  return NextResponse.json({ ok: true, url, method: "GET" }, { status: 200 });
}

