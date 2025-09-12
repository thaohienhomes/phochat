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
    if (!identity) return [] as any[];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [] as any[];

    // Query by both union types for backward compatibility
    const results: any[] = [];
    const byId = await ctx.db
      .query("chat_sessions")
      .withIndex("by_user", (q) => q.eq("user_id", user._id as any))
      .collect();
    results.push(...byId);
    const byStr = await ctx.db
      .query("chat_sessions")
      .withIndex("by_user", (q) => q.eq("user_id", String(user._id) as any))
      .collect();
    results.push(...byStr);

    // De-dupe and sort by created_at desc
    const map = new Map<string, any>();
    for (const s of results) map.set(String((s as any)._id), s);
    const all = Array.from(map.values());
    all.sort((a: any, b: any) => (b.created_at ?? 0) - (a.created_at ?? 0));

    const limited = typeof limit === "number" && limit > 0 ? all.slice(0, limit) : all;
    return limited.map((s: any) => ({
      _id: s._id,
      created_at: s.created_at,
      model: s.model,
      messagesCount: Array.isArray(s.messages) ? s.messages.length : 0,
      preview: (() => {
        const last = Array.isArray(s.messages) && s.messages.length > 0 ? s.messages[s.messages.length - 1] : null;
        const txt = last?.content || "New session";
        return txt.length > 60 ? txt.slice(0, 57) + "…" : txt;
      })(),
    }));
  },
});
