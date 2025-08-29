import { mutation } from "convex/_generated/server";
import { v } from "convex/values";

export const createChatSession = mutation({
  args: { userId: v.string(), model: v.string() },
  handler: async (ctx, { userId, model }) => {
    return await ctx.db.insert("chat_sessions", {
      user_id: userId,
      messages: [],
      model,
      created_at: Date.now(),
    });
  },
});

