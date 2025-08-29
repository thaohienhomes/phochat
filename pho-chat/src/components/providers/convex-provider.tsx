"use client";

import * as React from "react";
import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convex";

export function ConvexProviderClient({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

