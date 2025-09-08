"use client";

import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/toast';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProviderClient } from '@/components/providers/convex-provider';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const useClerk = !!pk && pk !== "pk_test_local";

  if (!useClerk) {
    if (typeof window !== "undefined") {
      console.warn("[Clerk] Skipping ClerkProvider in dev because publishable key is missing/placeholder.");
    }
    return (
      <ConvexProviderClient>
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </ConvexProviderClient>
    );
  }

  return (
    <ClerkProvider publishableKey={pk}>
      <ConvexProviderClient>
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </ConvexProviderClient>
    </ClerkProvider>
  );
}
