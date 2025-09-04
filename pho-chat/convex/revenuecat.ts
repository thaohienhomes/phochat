// Deprecated: webhook handling moved to convex/http.ts using httpAction.
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

export const handleRevenueCatWebhook = mutation({
  args: { headers: v.any(), body: v.any() },
  handler: async (ctx, { headers, body }) => {
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("REVENUECAT_WEBHOOK_SECRET is not set");
    }

    const signature = headers["x-revenuecat-signature"];
    if (!signature) {
      throw new Error("Webhook signature is missing");
    }

    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(JSON.stringify(body));
    const computedSignature = hmac.digest("hex");

    if (signature !== computedSignature) {
      throw new Error("Webhook signature does not match");
    }

    const { event } = body;
    const { app_user_id, entitlements } = event;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", app_user_id))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (entitlements.pro) {
      await ctx.db.patch(user._id, { tier: "pro" });
    } else {
      await ctx.db.patch(user._id, { tier: "free" });
    }

    return { ok: true };
  },
});