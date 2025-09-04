import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Very lightweight in-memory token bucket keyed by IP + path for basic rate limiting
// Note: In serverless, memory may reset between invocations. This is a best-effort limiter.
const buckets = new Map<string, { tokens: number; last: number }>();
const WINDOW_MS = 10_000; // 10 seconds
const CAPACITY = 10; // 10 requests per window

function allow(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: CAPACITY, last: now };
  const elapsed = now - bucket.last;
  const refill = Math.floor(elapsed / WINDOW_MS) * CAPACITY;
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill);
  bucket.last = now;
  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Protect AI endpoints and createChatSession
  const protectedPaths = [
    "/api/ai/stream",
    "/api/ai/test",
    "/api/createChatSession",
  ];
  if (protectedPaths.includes(pathname)) {
    const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "anon";
    const key = `${ip}:${pathname}`;
    if (!allow(key)) {
      return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/ai/stream",
    "/api/ai/test",
    "/api/createChatSession",
  ],
};

