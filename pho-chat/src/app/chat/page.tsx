"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types (lightweight)
type ChatMessage = { id: string; role: string; content: string; createdAt: number };

const MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "o3-mini", label: "o3-mini" },
];

export default function ChatPage() {
  const params = useSearchParams();
  const initialSessionId = params.get("sessionId");

  const [sessionId, setSessionId] = React.useState<string | null>(initialSessionId);
  const [model, setModel] = React.useState<string>(MODELS[0].id);
  const [input, setInput] = React.useState<string>("");
  const [streamingText, setStreamingText] = React.useState<string>("");
  const [sending, setSending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Live query for session
  const session = useQuery<any, any, any>("functions/getChatSession:getChatSession" as any, sessionId ? { sessionId } : "skip" as any);
  const messages: ChatMessage[] = session?.messages ?? [];

  React.useEffect(() => {
    if (!sessionId && initialSessionId) setSessionId(initialSessionId);
  }, [initialSessionId, sessionId]);

  async function handleSend() {
    if (!sessionId || !input.trim()) return;
    try {
      setError(null);
      setSending(true);
      setStreamingText("");

      // 1) Immediately persist user message
      await fetch("/api/test-sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: input }),
      });

      // 2) Kick off AI stream for assistant reply
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: input }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "AI stream failed");
      }

      // Stream chunks
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

      // 3) Persist assistant message after stream completes
      await fetch("/api/test-sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: acc }),
      });

      setInput("");
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto my-6 max-w-3xl">
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Tier: <span className="font-medium">free</span>{" "}
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
          </div>
        </div>

        <div className="h-[55vh] overflow-y-auto rounded-md border p-3 space-y-3 bg-background">
          {messages.length === 0 && !streamingText && (
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium mr-2">{m.role}:</span>
              <span className="whitespace-pre-wrap">{m.content}</span>
            </div>
          ))}
          {streamingText && (
            <div className="text-sm">
              <span className="font-medium mr-2">assistant:</span>
              <span className="whitespace-pre-wrap">{streamingText}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={sending || !input.trim() || !sessionId}>
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </Card>
    </div>
  );
}

