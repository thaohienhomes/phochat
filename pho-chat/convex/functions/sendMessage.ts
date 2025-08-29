import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    sessionId: v.id("chat_sessions"),
    message: v.object({
      id: v.string(), // message id
      role: v.string(), // e.g. "user" | "assistant"
      content: v.string(),
      createdAt: v.number(), // epoch millis
    }),
  },
  handler: async (
    { db }: MutationCtx,
    { sessionId, message }: { sessionId: any; message: { id: string; role: string; content: string; createdAt: number } }
  ) => {
    const session = await db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const messages = Array.isArray(session.messages) ? session.messages : [];
    const next = [...messages, message];

    await db.patch(sessionId, { messages: next });
    return { ok: true } as const;
  },
});

