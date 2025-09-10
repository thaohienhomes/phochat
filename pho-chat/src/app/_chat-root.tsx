"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { EnhancedChat } from "@/components/ui/enhanced-chat";
import { SubscriptionTier } from "@/lib/enums";
import { toChatSessionId } from "@/lib/ids";
import { Purchases } from "@revenuecat/purchases-js";
import { isProFromEntitlements } from "@/lib/revenuecat";
import { Button } from "@/components/ui/button";
import { Trash2, Eraser, Edit2 } from "lucide-react";
import Link from "next/link";

// Minimal model allowlist displayed in the EnhancedChat selector
const MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini", isPro: false },
  { id: "gpt-4o", label: "GPT-4o", isPro: true },
  { id: "o3-mini", label: "o3-mini", isPro: true },
  { id: "claude-3-haiku", label: "Claude 3 Haiku", isPro: false },
  { id: "claude-3-sonnet", label: "Claude 3.5 Sonnet", isPro: true },
];

export function ChatRoot() {
  const params = useSearchParams();
  const initialSessionId = params ? params.get("sessionId") : null;

  const [sessionId, setSessionId] = React.useState<string | null>(initialSessionId);
  const [model, setModel] = React.useState<string>(MODELS[0].id);
  const [input, setInput] = React.useState<string>("");
  const [streamingText, setStreamingText] = React.useState<string>("");
  const [sending, setSending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState<boolean>(false);
  const [blockedModelMsg, setBlockedModelMsg] = React.useState<string | null>(null);

  const [isPro, setIsPro] = React.useState(false);

  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();

  // Mutations/queries
  const storeUser = useMutation(api.users.storeUser);
  const deleteSessionMut = useMutation((api as any).functions.getChatSession.deleteUserSession);

  const clearSessionMut = useMutation((api as any).functions.getChatSession.clearUserSessionMessages);

  const renameSessionMut = useMutation((api as any).functions.getChatSession.renameUserSession);

  const tier = useQuery(api.users.getTier, isAuthenticated ? {} : "skip");
  const chatHistory = useQuery(
    api.functions.sendMessage.getChatHistoryForSession,
    sessionId ? { sessionId: toChatSessionId(sessionId) } : "skip"
  );
  const sessions = useQuery(
    // Using any until codegen is refreshed
    (api as any).functions.getChatSession.listUserSessions,
    isAuthenticated ? { limit: 30 } : "skip"
  );
  const createSessionMut = useMutation(api.functions.createChatSession.createChatSession);
  const sendMessageMut = useMutation(api.functions.sendMessage.sendMessage);

  // Guard to prevent rapid double-submits
  const sendGuardRef = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);

  // 1) Initialize RevenueCat just to compute Pro tier
  React.useEffect(() => {
    const initRevenueCat = async () => {
      if (user && typeof window !== "undefined") {
        const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
        if (!apiKey) return;
        const appUserId = user.id || (Purchases as any).generateRevenueCatAnonymousAppUserId?.();
        const purchases = Purchases.configure({ apiKey, appUserId });
        const customerInfo = await purchases.getCustomerInfo();
        setIsPro(isProFromEntitlements(customerInfo?.entitlements?.active));
      }
    };
    initRevenueCat();
  }, [user]);

  // 2) Store user in Convex once authenticated (link Clerk -> User)
  React.useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      storeUser({ clerkUserId: user.id });
    }
  }, [isAuthenticated, isLoading, user, storeUser]);

  // 3) Adopt initial sessionId from URL params on first load
  React.useEffect(() => {
    if (!sessionId && initialSessionId) setSessionId(initialSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSessionId]);

  // 4) Keep URL in sync with selected session (no navigation)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (sessionId) url.searchParams.set("sessionId", sessionId);
    else url.searchParams.delete("sessionId");
    window.history.replaceState(null, "", url);
  }, [sessionId]);


  // Adopt model from URL if provided, respecting plan; show note if blocked
  React.useEffect(() => {
    if (!params) return;
    const requested = params.get("model");
    if (!requested) return;
    const found = MODELS.find((m) => m.id === requested);
    if (!found) return;
    const canUsePro = isPro || tier === "team";
    if (found.isPro && !canUsePro) {
      const fallback = MODELS.find((m) => !m.isPro)?.label || "a free model";
      setBlockedModelMsg(`Requested model ${found.label} requires Pro. Using ${fallback} instead.`);
      return;
    }
    setBlockedModelMsg(null);
    setModel(found.id);
    // do not mutate URL here; keep user's provided link intact
  }, [params, isPro, tier]);

  // Global shortcuts: Cmd/Ctrl+K  New chat
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);


  function handleNewChat() {
    setSessionId(null);
    setStreamingText("");
    setInput("");


    setError(null);
  }

  function handleStop() {
    if (abortRef.current) abortRef.current.abort();
  }

  async function handleSend() {
    if (!user) return;
    if (!input.trim()) return;
    try {
      if (sendGuardRef.current) return;
      sendGuardRef.current = true;
      setError(null);
      setSending(true);


      setStreamingText("");

      let sid = sessionId;
      if (!sid) {
        try {
          const id = await createSessionMut({ model });
          sid = String(id);
          setSessionId(sid);
        } catch (e: any) {
          setError(e.message || String(e));
          return;
        }
      }

      const userMessage = {
        id: String(Date.now()),
        role: "user",
        content: input,
        createdAt: Date.now(),
      };
      await sendMessageMut({ sessionId: toChatSessionId(sid), message: userMessage });

      // Stream AI response
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: input }),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "AI stream failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let acc = "";
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          acc += chunk;
          setStreamingText(acc);
        }
      }
      abortRef.current = null;

      if (!acc) {
        try {
          const full = await fetch("/api/ai/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt: input }),
          }).then((r) => r.json());
          const text = full?.data?.choices?.[0]?.message?.content ?? "";
          if (text) setStreamingText(text);
          acc = text || acc;
        } catch {}
      }

      const assistantMessage = {
        id: `${Date.now()}-a`,
        role: "assistant",
        content: acc,
        createdAt: Date.now(),
      };
      await sendMessageMut({ sessionId: toChatSessionId(sid), message: assistantMessage });
      setInput("");
      setStreamingText("");
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSending(false);
      sendGuardRef.current = false;
    }
  }

  const currentSession = sessionId
    ? {
        id: sessionId,
        title: `Session ${sessionId}`,
        messages: ((chatHistory as any)?.messages ?? []).map((m: any) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        })),
        model,
        createdAt: new Date(),
      }
    : undefined;

  const handleEnhancedSend = (content: string) => {
    setInput(content);
    handleSend();
  };

  const userTier = isPro
    ? SubscriptionTier.PRO
    : tier === "team"
    ? SubscriptionTier.TEAM
    : SubscriptionTier.FREE;

  // Derive current title from first user message of loaded chatHistory
  const firstUserMsg = Array.isArray(chatHistory)
    ? (chatHistory as any[]).find((m) => m.role === "user")?.content
    : undefined;
  const currentTitle = firstUserMsg
    ? String(firstUserMsg).slice(0, 40) + (String(firstUserMsg).length > 40 ? "…" : "")
    : currentSession
    ? currentSession.title
    : "New chat";

  // Auth gate: prompt to sign in before using chat
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-2xl font-semibold">Welcome to pho.chat</div>
          <p className="text-sm text-muted-foreground">Sign in to start chatting with AI.</p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild className="bg-foreground text-background"><Link href="/sign-in">Sign in</Link></Button>
            <Button asChild variant="secondary"><Link href="/sign-up">Create account</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left sidebar: conversation history */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card/50">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold text-gradient">pho.chat</div>
        </div>
        <div className="p-4 space-y-3">
          <Button className="w-full" onClick={handleNewChat} variant="secondary">
            New chat
          </Button>
        </div>
        <div className="px-3 pb-3 text-xs uppercase text-muted-foreground">Recent</div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {Array.isArray(sessions) && sessions.length > 0 ? (
            (sessions as any[]).map((s) => (
              <div key={s.id} className={`group flex items-center gap-2 px-2 py-1 rounded-md ${s.id === sessionId ? 'bg-muted' : 'hover:bg-muted/60'}`}>
                <button
                  className="flex-1 text-left px-1 py-1"
                  onClick={() => { setSessionId(s.id); setStreamingText(''); setError(null); }}
                  title={s.title}
                >
                  <div className="truncate">{s.title || `Session ${String(s.id).slice(-6)}`}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.model} • {new Date(s.created_at).toLocaleString()}</div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    aria-label="Rename session"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const next = window.prompt('Rename session', s.title || '');
                      if (next == null) return;
                      const title = String(next).trim();
                      if (!title) return;
                      try { await renameSessionMut({ sessionId: toChatSessionId(s.id), title }); } catch (err) { console.error('Rename failed', err); }
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    aria-label="Clear messages"
                    className="text-muted-foreground hover:text-warning"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try { await clearSessionMut({ sessionId: toChatSessionId(s.id) }); if (sessionId === s.id) { setStreamingText(''); } } catch (err) { console.error('Clear failed', err); }
                    }}
                  >
                    <Eraser size={16} />
                  </button>
                  <button
                    aria-label="Delete session"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteSessionMut({ sessionId: toChatSessionId(s.id) });
                        if (sessionId === s.id) {
                          setSessionId(null);
                          setStreamingText('');
                        }
                      } catch (err) {
                        console.error('Delete failed', err);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground space-y-2">
              <div>No conversations yet</div>
              <Button size="sm" variant="secondary" onClick={handleNewChat}>Start a new chat</Button>
            </div>
          )}
        </div>
        <div className="p-3 border-t text-xs text-muted-foreground">Focus mode • Chat-first</div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        {blockedModelMsg && (
          <div className="mx-4 my-3 rounded border border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-900/10 dark:text-amber-200 px-3 py-2 text-xs">
            {blockedModelMsg}
          </div>
        )}
        {(() => {
          const canUsePro = isPro || userTier === SubscriptionTier.PRO || userTier === SubscriptionTier.TEAM;
          const visibleModels = MODELS.filter((m) => (m.isPro ? canUsePro : true));
          const info = canUsePro
            ? "Pro/Team: Access to GPT-4o, o3-mini, and Claude Sonnet."
            : "Free: Use GPT-4o mini. Upgrade to Pro for GPT-4o, o3-mini, and Claude Sonnet.";
          return (
            <EnhancedChat
              currentSession={currentSession}
              availableModels={visibleModels}
              userTier={userTier}
              isStreaming={sending}
              streamingText={streamingText}
              onSendMessage={handleEnhancedSend}
              onNewSession={handleNewChat}
              onModelChange={setModel}
              onStopStreaming={handleStop}
              modelInfo={info}
            />
          );
        })()}
        {error && (
          <div className="px-4 pb-4 text-sm text-destructive">{error}</div>
        )}
      </main>
    </div>
  );
}

