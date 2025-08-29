import { query } from "convex/server";
import { v } from "convex/values";

export const getChatSession = query({
  args: { sessionId: v.id("chat_sessions") },
  handler: async ({ db }, { sessionId }) => {
    const doc = await db.get(sessionId);
    return doc ?? null;
  },
});

