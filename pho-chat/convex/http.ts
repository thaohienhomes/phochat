import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import crypto from "crypto";

const http = httpRouter();

// Proper HTTP action for RevenueCat webhook
const revenuecatWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: "REVENUECAT_WEBHOOK_SECRET is not set" }), { status: 500 });
  }
  const signature = request.headers.get("x-revenuecat-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Webhook signature is missing" }), { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(JSON.stringify(body));
  const computedSignature = hmac.digest("hex");
  if (signature !== computedSignature) {
    return new Response(JSON.stringify({ error: "Webhook signature does not match" }), { status: 401 });
  }

  try {
    const { event } = body || {};
    const { app_user_id, entitlements } = event || {};

    // Map RevenueCat app_user_id to our stored user.
    // Prefer Clerk user id (by_clerk), fall back to tokenIdentifier (by_token).
    let user = null as any;
    if (app_user_id) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkUserId", app_user_id))
        .unique();
      if (!user) {
        user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", app_user_id))
          .unique();
      }
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const tier = entitlements?.pro ? "pro" : "free";
    await ctx.db.patch(user._id, { tier });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
});

http.route({
  path: "/revenuecat-webhook",
  method: "POST",
  handler: revenuecatWebhook,
});


export default http;