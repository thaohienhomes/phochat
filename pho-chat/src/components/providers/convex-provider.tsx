"use client";

import * as React from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { getConvexClient } from "@/lib/convex";
import type { ConvexReactClient } from "convex/react";

export function ConvexProviderClient({ children }: { children: React.ReactNode }) {
  // Create the client on the client after mount to avoid rendering children without provider
  const [client, setClient] = React.useState<ConvexReactClient | null>(null);
  React.useEffect(() => {
    setClient(getConvexClient());
  }, []);

  if (!client) {
    // While client is not ready (SSR hydration or no URL), avoid rendering children using convex hooks
    return null;
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
