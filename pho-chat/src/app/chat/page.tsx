"use client";
export const dynamic = 'force-dynamic';
export const revalidate = 0;


import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useUser, UserButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Purchases } from "@revenuecat/purchases-js";
import { RcPackage, extractPackages, isProFromEntitlements } from "@/lib/revenuecat";
import { toChatSessionId } from "@/lib/ids";

// Types (lightweight)
type ChatMessage = { id: string; role: string; content: string; createdAt: number };

const MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "o3-mini", label: "o3-mini" },
];

function SessionMessages({ sessionId }: { sessionId: string | null }) {
  const session = useQuery(
    api.functions.getChatSession.getChatSession,
    sessionId ? { sessionId } : "skip"
  );
  const loading = sessionId && !session;
  const messages: ChatMessage[] = (session as any)?.messages ?? [];
  if (!sessionId) return null;
  return (
    <>
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      )}
      {!loading && messages.length === 0 && (
        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
      )}
      {!loading && messages.map((m) => (
        <div key={m.id} className="text-sm">
          <span className="font-medium mr-2">{m.role}:</span>
          <span className="whitespace-pre-wrap">{m.content}</span>
        </div>
      ))}
    </>
  );
}

function ChatPageInner() {
  const params = useSearchParams();
  const initialSessionId = params ? params.get("sessionId") : null;

  const [sessionId, setSessionId] = React.useState<string | null>(initialSessionId);
  const [model, setModel] = React.useState<string>(MODELS[0].id);
  const [input, setInput] = React.useState<string>("");
  const [streamingText, setStreamingText] = React.useState<string>("");
  const [sending, setSending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { success } = useToast();

  const [creating, setCreating] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState(false);

  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const storeUser = useMutation(api.users.storeUser);


  const [products, setProducts] = React.useState<RcPackage[]>([]);
  const [isPro, setIsPro] = React.useState(false);

  React.useEffect(() => {
    const initRevenueCat = async () => {
      if (user && typeof window !== 'undefined') {
        const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
        if (!apiKey) return;
        const appUserId = user.id || (Purchases as any).generateRevenueCatAnonymousAppUserId?.();
        const purchases = Purchases.configure({ apiKey, appUserId });
        const offerings = await purchases.getOfferings();
        setProducts(extractPackages(offerings));
        const customerInfo = await purchases.getCustomerInfo();
        setIsPro(isProFromEntitlements(customerInfo?.entitlements?.active));
      }
    };
    initRevenueCat();
  }, [user]);

  const purchasePackage = async (pack: RcPackage) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) return;
      const appUserId = user?.id || (Purchases as any).generateRevenueCatAnonymousAppUserId?.();
      const purchases = Purchases.configure({ apiKey, appUserId });
      const result = await purchases.purchase({ rcPackage: pack as any });
      if (isProFromEntitlements(result?.customerInfo?.entitlements?.active)) {
        setIsPro(true);
      }
    } catch (e) {
      if (e && typeof e === 'object' && !(e as any).userCancelled) {
        console.log(e);
      }
    }
  };

  React.useEffect(() => {
    // If the user is signed in and we haven't stored them yet,
    // do so now, linking Clerk user id for RevenueCat mapping.
    if (isAuthenticated && !isLoading && user) {
      storeUser({ clerkUserId: user.id });
    }
  }, [isAuthenticated, isLoading, user, storeUser]);


  const tier = useQuery(api.users.getTier, isAuthenticated ? {} : "skip");
  const chatHistory = useQuery(
    api.functions.sendMessage.getChatHistoryForSession,
    sessionId ? { sessionId: toChatSessionId(sessionId) } : "skip"
  );

  // Guard to prevent rapid double-submits
  const sendGuardRef = React.useRef(false);

  // Refs for UX
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Autofocus on mount and after sends
  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-scroll when streaming or sending changes (only if user is near bottom)
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80; // px
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [streamingText, sending, sessionId]);

  // Persist input per session
  React.useEffect(() => {
    const key = `chat.input.${sessionId || "no-session"}`;
    const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (saved != null) setInput(saved);
  }, [sessionId]);
  React.useEffect(() => {
    const key = `chat.input.${sessionId || "no-session"}`;
    try { localStorage.setItem(key, input); } catch {}
  }, [input, sessionId]);

  function handleNewChat() {
    setSessionId(null);
    setStreamingText("");
    setInput("");
    setError(null);
    try { localStorage.removeItem(`chat.input.no-session`); } catch {}
    textareaRef.current?.focus();
  }

  function handleStop() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }

  function handleExport() {
    if (!chatHistory) return;
    const data = JSON.stringify(chatHistory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Mutations
  const createSessionMut = useMutation(api.functions.createChatSession.createChatSession);
  const sendMessageMut = useMutation(api.functions.sendMessage.sendMessage);

  React.useEffect(() => {
    if (!sessionId && initialSessionId) setSessionId(initialSessionId);
  }, [initialSessionId, sessionId]);

  async function handleCreateSession() {
    if (!user) return;
    console.log("[Chat] New Session clicked", { userId: user.id, model });
    try {
      setCreating(true);
      setError(null);
      const id = await createSessionMut({ model });
      console.log("[Chat] createChatSession result", id);
      setSessionId(String(id));
    } catch (e: any) {
      console.error("[Chat] createChatSession failed", e);
      setError(e.message || String(e));
    } finally {
      setCreating(false);
    }
  }

  async function handleSend() {
    if (!user) return;
    console.log("[Chat] Send clicked", { sessionId, inputLength: input.length, model });
    if (!input.trim()) {
      console.log("[Chat] Aborting send: empty input");
      return;
    }
    try {
      if (sendGuardRef.current) {
        console.log("[Chat] Guard: send in progress");
        return;
      }
      sendGuardRef.current = true;
      setError(null);
      setSending(true);
      setStreamingText("");

      let sid = sessionId;
      if (!sid) {
        try {
          const id = await createSessionMut({ model });
          console.log("[Chat] Auto-created session", id);
          sid = String(id);
          setSessionId(sid);
        } catch (e: any) {
          console.error("[Chat] auto create session failed", e);
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
      console.log("[Chat] sendMessage user", userMessage);
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
          const full = await fetch("/api/ai/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, prompt: input }) }).then(r => r.json());
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
      console.log("[Chat] sendMessage assistant", { length: acc.length });
      await sendMessageMut({ sessionId: toChatSessionId(sid), message: assistantMessage });
      setInput("");
      setStreamingText("");
    } catch (e: any) {
      console.error("[Chat] send flow failed", e);
      setError(e.message || String(e));
    } finally {
      setSending(false);
      sendGuardRef.current = false;
    }
  }

  return (
    <div className="mx-auto my-6 max-w-3xl">
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Tier: <span className="font-medium">{isPro ? "Pro" : tier ?? "..."}</span>{" "}
            {sessionId ? (
              <span className="ml-2">Session: {sessionId}</span>
            ) : (
              <span className="ml-2">No session loaded</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Model" /></SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isPro && products.map((pack: RcPackage) => (
              <Button key={pack.identifier} onClick={() => purchasePackage(pack)}>
                Upgrade to {pack.webBillingProduct?.title || pack.rcBillingProduct?.title || 'Pro'}
              </Button>
            ))}
            {tier === "team" && (
              <Link href="/admin">
                <Button>Admin</Button>
              </Link>
            )}
            {isLoading && <Skeleton className="h-8 w-8 rounded-full" />}
            {!isLoading && !isAuthenticated && (
              <Button onClick={() => window.location.href = "/sign-in"}>Sign In</Button>
            )}
            {!isLoading && isAuthenticated && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>

        {isAuthenticated && (
          <div className="rounded-md border p-3 space-y-2">
            <div className="flex justify-end">
              <Button onClick={handleCreateSession} disabled={creating}>
                {creating ? "Creating…" : "New Session"}
              </Button>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="h-[55vh] overflow-y-auto rounded-md border p-3 space-y-3 bg-background">
          <SessionMessages sessionId={sessionId} />
          {streamingText && (
            <div className="text-sm">
              <span className="font-medium mr-2">assistant:</span>
              <span className="whitespace-pre-wrap">{streamingText}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    setInput((prev) => `${prev}\n`);
                    return;
                  }
                  if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    return;
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!sending && !sendGuardRef.current && input.trim()) {
                      handleSend();
                    }
                  }
                }}
                placeholder="Type your message..."
                className="min-h-[100px]"
                disabled={!isAuthenticated}
              />
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Enter to send • Ctrl/Cmd+Enter newline</TooltipContent>
          </Tooltip>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(streamingText); setCopied(true); success("Copied"); setTimeout(()=>setCopied(false), 1200); }} disabled={!streamingText}>
                {copied ? "Copied!" : "Copy last reply"}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleNewChat}>
                New chat
              </Button>
              {tier === "pro" && (
                <Button size="sm" variant="outline" onClick={handleExport} disabled={!chatHistory}>
                  Export Chat
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Enter to send • Ctrl/Cmd+Enter newline</span>
              <Button size="sm" variant="destructive" onClick={handleStop} disabled={!sending}>
                Stop
              </Button>
              <Button onClick={handleSend} disabled={!isAuthenticated || sending || sendGuardRef.current || !input.trim()}>
                {sending ? "Sending..." : sendGuardRef.current ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div />}>
      <ChatPageInner />
    </React.Suspense>
  );
}

