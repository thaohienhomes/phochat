"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppHeader() {
  const { isAuthenticated } = useConvexAuth();
  const tier = useQuery(api.users.getTier, isAuthenticated ? {} : "skip");
  const plan = tier === "pro" ? "Pro" : tier === "team" ? "Team" : "Free";

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-sm">pho.chat</Link>
          <nav className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/checkout" className="hover:text-foreground">Checkout</Link>
            <Link href="/orders" className="hover:text-foreground">Orders</Link>
            <Link href="/settings" className="hover:text-foreground">Settings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={
                      plan === "Free"
                        ? "text-xs rounded-full border px-2 py-0.5 text-muted-foreground cursor-default"
                        : "inline-flex items-center text-xs rounded-full border px-2 py-0.5 text-green-700 bg-green-50 dark:text-green-200 dark:bg-green-900/20 cursor-default"
                    }
                  >
                    {plan}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {plan === "Free" ? (
                    <div className="text-xs">
                      Pro benefits: premium AI models (GPT-4o, Claude Sonnet), higher limits, priority performance.
                    </div>
                  ) : (
                    <div className="text-xs">You're on {plan}. Enjoy premium AI models and higher limits.</div>
                  )}
                </TooltipContent>
              </Tooltip>
              {plan === "Free" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="sm" variant="secondary">
                      <Link href="/checkout">Upgrade to Pro</Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">Upgrade to unlock GPT-4o, Claude Sonnet, and higher daily limits.</div>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign in</Button>
            </SignInButton>
            <Button asChild size="sm" variant="secondary"><Link href="/sign-up">Sign up</Link></Button>
          </SignedOut>
          <SignedIn>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "h-7 w-7" } }} />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

