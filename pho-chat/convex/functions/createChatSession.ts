import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { v } from "convex/values";

const ALLOWED_MODELS = new Set(["gpt-4o-mini", "gpt-4o", "o3-mini"]);

export const createChatSession = mutation({
  args: { model: v.string() },
  handler: async (ctx: MutationCtx, { model }: { model: string }) => {
    if (!ALLOWED_MODELS.has(model)) {
      throw new Error("Unsupported model");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called createChatSession without authentication");
    }

    // Resolve or create user by tokenIdentifier; attach clerkUserId if provided later via storeUser
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    let userId = existing?._id;
    if (!userId) {
      userId = await ctx.db.insert("users", {
        name: identity.name ?? "",
        tokenIdentifier: identity.tokenIdentifier,
        clerkUserId: "",
        tier: "free",
      });
    }

    return await ctx.db.insert("chat_sessions", {
      user_id: userId,
      messages: [],
      model,
      created_at: Date.now(),
    });
  },
});

