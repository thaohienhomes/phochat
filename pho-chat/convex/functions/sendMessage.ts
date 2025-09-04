import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

const MessageSchema = v.object({ id: v.string(), role: v.string(), content: v.string(), createdAt: v.number() });

export const getChatHistoryForSession = query({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx: QueryCtx, { sessionId }: { sessionId: Id<"chat_sessions"> }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    const session = await ctx.db.get(sessionId);
    if (!session) return null;
    if (String((session as any).user_id) !== String(user._id)) return null;

    return (session as any).messages ?? [];
  },
});

export const sendMessage = mutation({
  args: { sessionId: v.id("chat_sessions"), message: MessageSchema },
  handler: async (ctx: MutationCtx, { sessionId, message }: { sessionId: Id<"chat_sessions">; message: any }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called sendMessage without authentication");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    // For free tier, do not persist history
    if (user.tier === "free") {
      return { ok: true } as const;
    }

    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (String((session as any).user_id) !== String(user._id)) {
      throw new Error("Forbidden: session does not belong to user");
    }

    const messages = Array.isArray((session as any).messages) ? (session as any).messages : [];
    await ctx.db.patch(sessionId, { messages: [...messages, message] });

    return { ok: true } as const;
  },
});

