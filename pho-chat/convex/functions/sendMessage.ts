import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

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
    ctx: MutationCtx,
    { sessionId, message }: { sessionId: any; message: { id: string; role: string; content: string; createdAt: number } }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called sendMessage without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user === null) {
      throw new Error("User not found");
    }

    if (user.tier === "free") {
      // For free users, we don't save the chat history.
      return { ok: true } as const;
    }

    const session = await ctx.db.get(sessionId) as Doc<"chat_sessions">;
    if (!session) throw new Error("Session not found");

    // Ensure the session belongs to the authenticated user
    if (String(session.user_id) !== String(user._id)) {
      throw new Error("Forbidden: session does not belong to user");
    }

    const messages = Array.isArray(session.messages) ? session.messages : [];
    const next = [...messages, message];

    await ctx.db.patch(sessionId, { messages: next });
    return { ok: true } as const;
  },
});

export const getChatHistory = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user === null) {
      return [];
    }

    const sessions = await ctx.db
      .query("chat_sessions")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();

    return sessions;
  },
});

export const getChatHistoryForSession = query({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx: QueryCtx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    const session = await ctx.db.get(sessionId) as Doc<"chat_sessions">;
    if (!session) return null;
    if (String(session.user_id) !== String(user._id)) return null;

    return session;
  },
});
