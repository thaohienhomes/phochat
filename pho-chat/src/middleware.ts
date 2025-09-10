import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

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

// Use Clerk middleware to enable auth() in API routes/pages; also run our rate-limiter.
export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Basic rate limiting for selected endpoints
  const limitedPaths = [
    "/api/ai/stream",
    "/api/ai/test",
    "/api/createChatSession",
  ];
  if (limitedPaths.includes(pathname)) {
    const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "anon";
    const key = `${ip}:${pathname}`;
    if (!allow(key)) {
      return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    }
  }

  // No explicit protection here; specific routes handle auth in the handler.
  return NextResponse.next();
});

export const config = {
  // Ensure Clerk middleware runs on our API routes incl. admin reconcile
  matcher: [
    "/api/ai/stream",
    "/api/ai/test",
    "/api/createChatSession",
    "/api/admin/(.*)",
    "/(api|trpc)(.*)",
  ],
};

