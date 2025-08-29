"use client";

import { ConvexReactClient } from "convex/_generated/react";

export const convex = new ConvexReactClient(
  // Will be inlined by Next for client components
  (import.meta as any)?.env?.NEXT_PUBLIC_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210",
);

