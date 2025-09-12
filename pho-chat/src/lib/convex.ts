"use client";

import { ConvexReactClient } from "convex/react";

// Lazily construct Convex client only on the client with a valid absolute URL
export function getConvexClient(): ConvexReactClient | null {
  if (typeof window === "undefined") return null;

  const INLINE_URL = process.env.NEXT_PUBLIC_CONVEX_URL as string | undefined;

  // More robust local fallbacks for common dev hosts
  const host = window.location.hostname;
  const isLocalHost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.startsWith("172.16.") || host.startsWith("172.17.") || host.startsWith("172.18.") || host.startsWith("172.19.") || host.startsWith("172.2") || host.startsWith("172.30.") || host.startsWith("172.31.");

  const fallbackDevUrl = isLocalHost ? "http://127.0.0.1:3210" : undefined;
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

