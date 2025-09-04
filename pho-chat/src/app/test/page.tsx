"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TestPage() {
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [sendError, setSendError] = React.useState<string | null>(null);

  const canCreate = Boolean(model.trim());
  const canSend = Boolean(sessionId && content.trim());

  async function createSession() {
    try {
      setCreateError(null);
      setResult(null);
      setCreating(true);
      const res = await fetch("/api/createChatSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create session");
      // API returns the inserted id; handle string or object
      const id = typeof data === "string" ? data : data?.id || data?._id || data;
      setSessionId(String(id));
    } catch (e: any) {
      setCreateError(String(e.message || e));
    } finally {
      setCreating(false);
    }
  }

  async function sendMessage() {
    if (!sessionId) return;
    try {
      setSendError(null);
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
      setSendError(String(e.message || e));
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
            placeholder="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
        <Button onClick={createSession} disabled={creating || !canCreate}>
          {creating ? "Creating..." : "Create Session"}
        </Button>
        {sessionId && (
          <Input
            readOnly
            value={sessionId}
            className="border-green-500 focus-visible:ring-green-500"
          />
        )}
        {createError && (
          <p className="text-sm text-destructive">{createError}</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Send Message</h2>
        <Textarea
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
        />
        <Button onClick={sendMessage} disabled={sending || !canSend}>
          {sending ? "Sending..." : "Send Message"}
        </Button>
        {sendError && (
          <p className="text-sm text-destructive">{sendError}</p>
        )}
      </section>

      {result && (
        <section className="space-y-2">
          <h3 className="text-md font-medium">Response</h3>
          <pre className="whitespace-pre-wrap font-mono bg-muted overflow-auto rounded-md border p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

