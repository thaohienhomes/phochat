import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";

export const getChatSession = query({
  args: { sessionId: v.optional(v.id("chat_sessions")) },
  handler: async (ctx: QueryCtx, { sessionId }: { sessionId?: any }) => {
    if (!sessionId) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    const doc = await ctx.db.get(sessionId);
    if (!doc) return null;
    if (String((doc as any).user_id) !== String(user._id)) return null;
    return doc;
  },
});



export const listUserSessions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, { limit }: { limit?: number }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    const rows = await ctx.db
      .query("chat_sessions")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();

    const sorted = rows.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
    const limited = sorted.slice(0, Math.max(1, Math.min(200, limit || 30)));

    return limited.map((s: any) => {
      const firstUserMsg = Array.isArray(s.messages) ? s.messages.find((m: any) => m.role === "user")?.content : undefined;
      const computed = firstUserMsg
        ? String(firstUserMsg).slice(0, 40) + (String(firstUserMsg).length > 40 ? "…" : "")
        : `Session ${String(s._id).slice(-6)}`;
      const title = (s as any).title && typeof (s as any).title === 'string' && (s as any).title.trim() ? (s as any).title : computed;
      return {
        id: String(s._id),
        title,
        model: s.model,
        created_at: s.created_at,
        messageCount: Array.isArray(s.messages) ? s.messages.length : 0,
      };
    });
  },
});


import { mutation } from "../_generated/server";

export const deleteUserSession = mutation({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const session = await ctx.db.get(sessionId);
    if (!session) return { ok: true } as const; // idempotent
    if (String((session as any).user_id) !== String(user._id)) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(sessionId);
    return { ok: true } as const;
  },
});


export const clearUserSessionMessages = mutation({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const session = await ctx.db.get(sessionId);
    if (!session) return { ok: true } as const; // idempotent
    if (String((session as any).user_id) !== String(user._id)) {
      throw new Error("Forbidden");
    }

    await ctx.db.patch(sessionId, { messages: [] });
    return { ok: true } as const;
  },
});


export const renameUserSession = mutation({
  args: { sessionId: v.id("chat_sessions"), title: v.string() },
  handler: async (ctx, { sessionId, title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const session = await ctx.db.get(sessionId);
    if (!session) return { ok: true } as const; // idempotent
    if (String((session as any).user_id) !== String(user._id)) {
      throw new Error("Forbidden");
    }

    const safe = title.trim().slice(0, 120);
    await ctx.db.patch(sessionId, { title: safe });
    return { ok: true } as const;
  },
});
