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

