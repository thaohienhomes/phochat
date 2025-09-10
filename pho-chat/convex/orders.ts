import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const createOrReusePending = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    currency: v.optional(v.string()),
    description: v.optional(v.string()),
    orderCode: v.number(),
    provider: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_orderCode", (q) => q.eq("orderCode", args.orderCode))
      .first();

    if (existing) {
      console.log("[orders] reuse", { orderCode: args.orderCode, existing: existing._id });
      return existing._id;
    }

    const id = await ctx.db.insert("orders", {
      user_id: args.userId,
      amount: args.amount,
      currency: args.currency ?? "VND",
      status: "pending",
      provider: args.provider ?? "payos",
      orderCode: args.orderCode,
      description: args.description,
      metadata: args.metadata,
      created_at: now,
      updated_at: now,
    } as any);
    console.log("[orders] created", { orderCode: args.orderCode, id });
    return id;
  },
});

export const attachCheckoutInfo = mutation({
  args: {
    orderCode: v.number(),
    paymentLinkId: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
  },
  handler: async (ctx, { orderCode, paymentLinkId, checkoutUrl }) => {
    const row = await ctx.db
      .query("orders")
      .withIndex("by_orderCode", (q) => q.eq("orderCode", orderCode))
      .first();
    if (!row) return null;
    await ctx.db.patch(row._id, { paymentLinkId, checkoutUrl, updated_at: Date.now() });
    return row._id;
  },
});

export const setStatusByOrderCode = mutation({
  args: { orderCode: v.number(), status: v.string() },
  handler: async (ctx, { orderCode, status }) => {
    const row = await ctx.db
      .query("orders")
      .withIndex("by_orderCode", (q) => q.eq("orderCode", orderCode))
      .first();
    if (!row) return null;
    // Idempotent update: only allow forward transitions from pending
    const allowed = ["succeeded", "failed", "expired"];
    if (row.status === "pending" && allowed.includes(status)) {
      await ctx.db.patch(row._id, { status, updated_at: Date.now() });
      console.log("[orders] status", { orderCode, from: row.status, to: status });
    }
    return row._id;
  },
});

export const statusByOrderCode = query({
  args: { orderCode: v.number() },
  handler: async (ctx, { orderCode }) => {
    const row = await ctx.db
      .query("orders")
      .withIndex("by_orderCode", (q) => q.eq("orderCode", orderCode))
      .first();
    if (!row) return { status: "not_found" };
    return { status: row.status, amount: row.amount, orderCode, orderId: row._id };
  },
});

export const orderByOrderCode = query({
  args: { orderCode: v.number() },
  handler: async (ctx, { orderCode }) => {
    const row = await ctx.db
      .query("orders")
      .withIndex("by_orderCode", (q) => q.eq("orderCode", orderCode))
      .first();
    return row ?? null;
  },
});


export const recordEventIfNew = mutation({
  args: { eventHash: v.string(), orderCode: v.number(), payload: v.any() },
  handler: async (ctx, { eventHash, orderCode, payload }) => {
    const existed = await ctx.db
      .query("payos_events")
      .withIndex("by_event_hash", (q) => q.eq("event_hash", eventHash))
      .first();
    if (existed) return false;
    await ctx.db.insert("payos_events", {
      event_hash: eventHash,
      orderCode,
      received_at: Date.now(),
      payload,
    } as any);
    console.log("[payos_events] recorded", { orderCode, eventHash });
    return true;
  },
});



export const listPendingOlderThan = query({
  args: { olderThan: v.number() },
  handler: async (ctx, { olderThan }) => {
    const rows = await ctx.db.query("orders").withIndex("by_created").collect();
    return rows.filter((o: any) => o.status === "pending" && o.created_at < olderThan);
  },
});

export const setStatusById = mutation({
  args: { orderId: v.id("orders"), status: v.string() },
  handler: async (ctx, { orderId, status }) => {
    const row = await ctx.db.get(orderId);
    if (!row) return null;
    const allowed = ["succeeded", "failed", "expired"];

    if (row.status === "pending" && allowed.includes(status)) {
      await ctx.db.patch(orderId, { status, updated_at: Date.now() });
    }
    return orderId;
  },
});


export const orderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const row = await ctx.db.get(orderId);
    if (!row) return null;
    return row;
  },
});


export const listRecent = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { status, limit }) => {
    const rows = await ctx.db.query("orders").withIndex("by_created").collect();
    const filtered = status ? rows.filter((o: any) => o.status === status) : rows;
    const sorted = filtered.sort((a: any, b: any) => b.created_at - a.created_at);
    return sorted.slice(0, Math.max(1, Math.min(200, limit || 50)));
  },
});
