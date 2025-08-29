"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TestPage() {
  const [userId, setUserId] = React.useState("");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function createSession() {
    try {
      setError(null);
      setResult(null);
      setCreating(true);
      const res = await fetch("/api/createChatSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create session");
      // API returns the inserted id; handle string or object
      const id = typeof data === "string" ? data : data?.id || data?._id || data;
      setSessionId(String(id));
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setCreating(false);
    }
  }

  async function sendMessage() {
    if (!sessionId) return;
    try {
      setError(null);
      setSending(true);
      const res = await fetch("/api/test-sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send message");
      setResult(data);
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto my-10 max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">Test: createChatSession & sendMessage</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Create Session</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            placeholder="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Input
            placeholder="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
        <Button onClick={createSession} disabled={creating || !userId || !model}>
          {creating ? "Creating..." : "Create Session"}
        </Button>
        {sessionId && (
          <p className="text-sm text-muted-foreground">Session ID: {sessionId}</p>
        )}
      </section>

      {sessionId && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Send Message</h2>
          <Textarea
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
          <Button onClick={sendMessage} disabled={sending || !content}>
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </section>
      )}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          Error: {error}
        </div>
      )}

      {result && (
        <section className="space-y-2">
          <h3 className="text-md font-medium">Response</h3>
          <pre className="overflow-auto rounded-md border p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

