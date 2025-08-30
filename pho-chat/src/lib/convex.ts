"use client";

import { ConvexReactClient } from "convex/react";

// Lazily construct Convex client only on the client with a valid absolute URL
export function getConvexClient(): ConvexReactClient | null {
  if (typeof window === "undefined") return null;

  const INLINE_URL = process.env.NEXT_PUBLIC_CONVEX_URL as string | undefined;
  const fallbackDevUrl = window.location.hostname === "localhost" ? "http://127.0.0.1:3210" : undefined;
  const resolvedUrl = INLINE_URL ?? fallbackDevUrl;

  if (!resolvedUrl) {
    console.warn(
      "[Convex] NEXT_PUBLIC_CONVEX_URL is not set and no local fallback is available. Convex disabled."
    );
    return null;
  }

  try {
    // Ensure absolute URL; ConvexReactClient will validate internally as well
    new URL(resolvedUrl);
  } catch {
    console.error("[Convex] Provided URL is not absolute:", resolvedUrl);
    return null;
  }

  console.log("[Convex] Using deployment:", resolvedUrl);
  return new ConvexReactClient(resolvedUrl);
}

