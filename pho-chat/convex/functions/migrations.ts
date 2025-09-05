import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

export const listInvalidChatSessions = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const sessions = await ctx.db.query("chat_sessions").collect();
    const invalid: Array<{ _id: Id<"chat_sessions">; user_id: unknown }> = [];
    for (const s of sessions) {
      const uid: any = (s as any).user_id;
      const looksLikeId = uid && typeof uid === "object" && "tableName" in uid && uid.tableName === "users";
      if (!looksLikeId) invalid.push({ _id: s._id, user_id: uid });
    }
    return { count: invalid.length, invalid };
  },
});

export const cleanChatSessions = mutation({
  args: { dryRun: v.boolean() },
  handler: async (ctx: MutationCtx, { dryRun }: { dryRun: boolean }) => {
    const sessions = await ctx.db.query("chat_sessions").collect();
    const repaired: Array<Id<"chat_sessions">> = [];
    const deleted: Array<Id<"chat_sessions">> = [];
    const skipped: Array<Id<"chat_sessions">> = [];

    for (const s of sessions) {
      const uid: any = (s as any).user_id;
      const isValidId = uid && typeof uid === "object" && "tableName" in uid && uid.tableName === "users";
      if (isValidId) {
        continue;
      }

      let user: any = null;
      if (typeof uid === "string") {
        user = await ctx.db
          .query("users")
          .withIndex("by_clerk", (q) => q.eq("clerkUserId", uid))
          .unique();
        if (!user) {
          user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", uid))
            .unique();
        }
      }

      if (user) {
        if (!dryRun) await ctx.db.patch(s._id, { user_id: user._id });
        repaired.push(s._id);
      } else {
        if (!dryRun) await ctx.db.delete(s._id);
        deleted.push(s._id);
      }
    }

    return {
      dryRun,
      repairedCount: repaired.length,
      deletedCount: deleted.length,
      skippedCount: skipped.length,
      repaired,
      deleted,
      skipped,
    };
  },
});

