"use client";

import { ConvexReactClient } from "convex/react";

// Resolve Convex deployment URL at build time (NEXT_PUBLIC_ vars are inlined by Next)
const INLINE_URL = process.env.NEXT_PUBLIC_CONVEX_URL as string | undefined;

// In dev without env, fall back to local Convex dev server; in prod, require INLINE_URL
const fallbackDevUrl = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://127.0.0.1:3210"
  : undefined;

const resolvedUrl = INLINE_URL ?? fallbackDevUrl;

if (typeof window !== "undefined") {
  if (!INLINE_URL) {
    // Helpful hint in browser console if env not set
    console.warn(
      "[Convex] NEXT_PUBLIC_CONVEX_URL is not set. Using",
      resolvedUrl ?? "undefined",
      "— set NEXT_PUBLIC_CONVEX_URL to your https://<deployment>.convex.cloud"
    );
  } else {
    console.log("[Convex] Using deployment:", INLINE_URL);
  }
}

export const convex = new ConvexReactClient(resolvedUrl ?? "");

