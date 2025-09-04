import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: { clerkUserId: v.optional(v.string()) },
  handler: async (ctx, { clerkUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this user.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (user !== null) {
<<<<<<< HEAD
      const patch: Record<string, any> = {};
      if (user.name !== (identity.name ?? "")) patch.name = identity.name ?? "";
      if (clerkUserId && user.clerkUserId !== clerkUserId) patch.clerkUserId = clerkUserId;
      if (Object.keys(patch).length) await ctx.db.patch(user._id, patch);

      return user._id;
    }
    // If it's a new identity, create a new user.
    return await ctx.db.insert("users", {
      name: identity.name ?? "",
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId: clerkUserId ?? "",
      tier: "free",
    });
  },
});

export const upgradeToPro = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called upgradeToPro without authentication present");
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

    await ctx.db.patch(user._id, { tier: "pro" });
  },
});

export const upgradeToTeam = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called upgradeToTeam without authentication present");
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

    await ctx.db.patch(user._id, { tier: "team" });
  },
});

export const getTier = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user?.tier ?? null;
  },
});

export const isTeamMember = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user?.tier === "team";
  },
});