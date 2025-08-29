import { httpAction, mutation } from "convex/server";
import { v } from "convex/values";

export const handleWebhook = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const provider = url.searchParams.get("provider") || "unknown";
    const body = await request.json().catch(() => ({}));

    if (provider === "revenuecat") {
      // Example RevenueCat webhook payload shape is varied; we accept any and map basics
      const userId: string | undefined = body?.app_user_id || body?.event?.app_user_id;
      const tier: string | undefined = body?.entitlements?.pro ? "pro" : "free";
      const expiryMs: number | undefined = body?.expiration_at_ms || body?.event?.expiration_at_ms;

      if (userId) {
        const existing = await ctx.db
          .query("subscriptions")
          .withIndex("by_user", q => q.eq("user_id", userId))
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, {
            tier: tier ?? existing.tier,
            expiry: expiryMs ?? existing.expiry,
            receipts: body,
          });
        } else {
          await ctx.db.insert("subscriptions", {
            user_id: userId,
            tier: tier ?? "free",
            expiry: expiryMs ?? Date.now(),
            receipts: body,
          });
        }

        await ctx.db.insert("payments", {
          user_id: userId,
          amount: 0, // RevenueCat purchases may not include amount here
          status: "succeeded",
          provider: "revenuecat",
          created_at: Date.now(),
        });
      }
    } else if (provider === "qr") {
      const userId: string | undefined = body?.userId;
      const amount: number | undefined = body?.amount;
      const status: string = body?.status ?? "pending";

      if (userId && typeof amount === "number") {
        await ctx.db.insert("payments", {
          user_id: userId,
          amount,
          status,
          provider: "qr",
          created_at: Date.now(),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});

// Optional: convenience mutation to upsert subscription (not exposed via HTTP)
export const upsertSubscription = mutation({
  args: {
    userId: v.string(),
    tier: v.string(),
    expiry: v.number(),
    receipts: v.any(),
  },
  handler: async ({ db }, { userId, tier, expiry, receipts }) => {
    const existing = await db
      .query("subscriptions")
      .withIndex("by_user", q => q.eq("user_id", userId))
      .unique();

    if (existing) {
      await db.patch(existing._id, { tier, expiry, receipts });
      return existing._id;
    }

    return await db.insert("subscriptions", { user_id: userId, tier, expiry, receipts });
  },
});

