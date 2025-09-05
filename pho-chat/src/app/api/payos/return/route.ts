import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Stub: echo back query so client UI can decide success/pending/failure
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return new Response(JSON.stringify({ ok: true, params }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

