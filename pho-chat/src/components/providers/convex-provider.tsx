"use client";

import * as React from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { getConvexClient } from "@/lib/convex";

/**
 * Wraps Clerk's `useAuth` so the `getToken` call made by
 * `ConvexProviderWithClerk` in the background never throws an uncaught
 * rejection.
 *
 * When a Clerk session is inactive, expired, or revoked, the Frontend API
 * rejects `getToken` with a 401 ("Unable to authenticate the request, you need
 * to supply an active session"). That is an expected signed-out state, not a
 * bug — but left unhandled it bubbles up as an unhandled client-side error and
 * pollutes error tracking. Returning `null` instead makes Convex treat the user
 * as unauthenticated (the correct outcome), and Convex will re-mint a token on
 * its own once a valid session is available again.
 */
function useAuthForConvex() {
  const auth = useAuth();
  const originalGetToken = auth.getToken;

  const getToken = React.useCallback<typeof originalGetToken>(
    async (options) => {
      try {
        return await originalGetToken(options);
      } catch {
        // Expected when the session is inactive/expired/revoked. Signal
        // "no token" rather than letting the rejection go uncaught.
        return null;
      }
    },
    [originalGetToken]
  );

  return React.useMemo(() => ({ ...auth, getToken }), [auth, getToken]);
}

export function ConvexProviderClient({ children }: { children: React.ReactNode }) {
  // Lazily create the client on the client-side only
  const clientRef = React.useRef(getConvexClient());

  if (!clientRef.current) {
    // Convex not configured; render children without provider
    return <>{children}</>;
  }


  return (
    <ConvexProviderWithClerk client={clientRef.current} useAuth={useAuthForConvex}>
      {children}
    </ConvexProviderWithClerk>
  );

}
