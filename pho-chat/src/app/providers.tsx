"use client";

import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/toast';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProviderClient } from '@/components/providers/convex-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderClient>
        <ToastProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ToastProvider>
      </ConvexProviderClient>
    </ClerkProvider>
  );
}

