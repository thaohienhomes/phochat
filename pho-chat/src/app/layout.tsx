"use client";

import type { Metadata } from 'next';
export { metadata } from './metadata';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Example shadcn/ui providers imported for ease of use across the app
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/toast';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProviderClient } from '@/components/providers/convex-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderClient>
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <ToastProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </ToastProvider>
          </body>
        </html>
      </ConvexProviderClient>
    </ClerkProvider>
  );
}