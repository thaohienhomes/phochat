"use client";

import * as React from "react";
import { ConvexProvider } from "convex/react";
import { getConvexClient } from "@/lib/convex";

export function ConvexProviderClient({ children }: { children: React.ReactNode }) {
  // Lazily create the client on the client-side only
  const clientRef = React.useRef(getConvexClient());

  if (!clientRef.current) {
    // Convex not configured; render children without provider
    return <>{children}</>;
  }

  return <ConvexProvider client={clientRef.current}>{children}</ConvexProvider>;
}
