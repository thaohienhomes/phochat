"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/brand/Logo";
import ChatApp from "@/app/chat/page";
import { Menu, Moon, Sun } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ChatShell() {
  const [open, setOpen] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const { isAuthenticated } = useConvexAuth();
  const sessions = useQuery((api as any).functions.getChatSession.listUserSessions, isAuthenticated ? { limit: 50 } : "skip");


  // Theme state with persistence
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("pho_theme") : null;
      const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = (saved === "dark" || (!saved && prefersDark)) ? "dark" : "light";
      setTheme(initial);
      if (initial === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch {}
  }, []);
  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (next === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      try { localStorage.setItem("pho_theme", next); } catch {}
      return next;
    });
  }, []);

  const fireNewChat = React.useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("pho:new-chat"));
      setOpen(false);
    } catch {}
  }, []);

  const openSession = React.useCallback((id: string) => {
    try {
      window.dispatchEvent(new CustomEvent("pho:open-session", { detail: id }));
      setOpen(false);
    } catch {}
  }, []);

  const recent = Array.isArray(sessions) ? sessions.slice(0, 5) : [];
  const history = Array.isArray(sessions) ? sessions.slice(5) : [];

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Skip link for a11y */}
      <a href="#main-content" className="sr-only focus:not-sr-only fixed left-2 top-2 z-[60] rounded bg-primary px-3 py-1 text-primary-foreground shadow">
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-none items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2">
            {/* Mobile: open sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open sidebar">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0" aria-label="Chat session history">
                <SheetHeader className="px-3 py-2">
                  <SheetTitle className="flex items-center gap-2 text-sm">
                    <Logo className="h-5 w-5" /> <span className="font-semibold">pho.chat</span>
                  </SheetTitle>
                </SheetHeader>
                <nav role="navigation" aria-label="Chat session history" className="border-t p-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-muted-foreground">Menu</div>
                    <Button size="sm" onClick={fireNewChat}>New chat</Button>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">Recent</div>
                    <ul className="space-y-1 text-sm">
                      {recent.length === 0 && <li className="text-muted-foreground px-2 py-1">No sessions</li>}
                      {recent.map((s: any) => (
                        <li key={String(s._id)}>
                          <button className="w-full rounded-md px-2 py-1 text-left hover:bg-muted focus:bg-muted focus:outline-none" onClick={() => openSession(String(s._id))} aria-label={`Open session ${s.preview || s._id}`}>
                            {s.preview || String(s._id)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">History</div>
                    <ul className="space-y-1 text-sm">
                      {history.length === 0 && <li className="text-muted-foreground px-2 py-1">No older sessions</li>}
                      {history.map((s: any) => (
                        <li key={String(s._id)}>
                          <button className="w-full rounded-md px-2 py-1 text-left hover:bg-muted focus:bg-muted focus:outline-none" onClick={() => openSession(String(s._id))} aria-label={`Open session ${s.preview || s._id}`}>
                            {s.preview || String(s._id)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            <Logo className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold tracking-tight">pho.chat</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex" aria-pressed={sidebarVisible} onClick={() => setSidebarVisible((v) => !v)}>
              {sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={fireNewChat}>New chat</Button>
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm">Sign in</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main */}
      <div className="mx-auto flex w-full max-w-none flex-1 gap-4 px-3 py-4 sm:px-4">
        {/* Sidebar (desktop) */}
        {sidebarVisible && (
          <aside className="hidden w-72 shrink-0 md:block" aria-label="Chat session history">
            <Card className="h-full p-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">Menu</div>
                <Button size="sm" variant="secondary" onClick={fireNewChat}>New chat</Button>
              </div>
              <nav role="navigation" aria-label="Recent sessions">
                <div className="mb-2 text-xs font-medium text-muted-foreground">Recent</div>
                <ul className="space-y-1 text-sm">
                  {recent.length === 0 && <li className="text-muted-foreground px-2 py-1">No sessions</li>}
                  {recent.map((s: any) => (
                    <li key={String(s._id)}>
                      <button className="w-full rounded-md px-2 py-1 text-left hover:bg-muted focus:bg-muted focus:outline-none" onClick={() => openSession(String(s._id))} aria-label={`Open session ${s.preview || s._id}`}>
                        {s.preview || String(s._id)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav role="navigation" aria-label="Older sessions">
                <div className="mb-2 text-xs font-medium text-muted-foreground">History</div>
                <ul className="space-y-1 text-sm">
                  {history.length === 0 && <li className="text-muted-foreground px-2 py-1">No older sessions</li>}
                  {history.map((s: any) => (
                    <li key={String(s._id)}>
                      <button className="w-full rounded-md px-2 py-1 text-left hover:bg-muted focus:bg-muted focus:outline-none" onClick={() => openSession(String(s._id))} aria-label={`Open session ${s.preview || s._id}`}>
                        {s.preview || String(s._id)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </Card>
          </aside>
        )}

        {/* Main content */}
        <main id="main-content" className="flex min-h-[70dvh] flex-1 flex-col">
          <ChatApp />
        </main>
      </div>
    </div>
  );
}

