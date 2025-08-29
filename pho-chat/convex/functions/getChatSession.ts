import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";

export const getChatSession = query({
  args: { sessionId: v.id("chat_sessions") },
  handler: async ({ db }: QueryCtx, { sessionId }: { sessionId: any }) => {
    const doc = await db.get(sessionId);
    return doc ?? null;
  },
});

