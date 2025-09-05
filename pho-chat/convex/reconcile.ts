"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const reconcilePending = action({
  args: { olderThanMs: v.number() },
  handler: async (ctx, { olderThanMs }) => {
    const cutoff = Date.now() - olderThanMs;

    // Actions cannot access ctx.db; call queries/mutations instead.
    const pending = await ctx.runQuery(api.orders.listPendingOlderThan, { olderThan: cutoff });

    // Note: For now we don't call PayOS from this action, to avoid requiring PAYOS_* envs in Convex.
    // If PayOS exposes a read API by orderCode, we can add it later and guard on env presence.
    const results: any[] = [];

    for (const order of pending as any[]) {
      try {
        await ctx.runMutation(api.orders.setStatusById, { orderId: order._id, status: "expired" });
        results.push({ orderCode: order.orderCode, status: "expired" });
      } catch (e: any) {
        results.push({ orderCode: order.orderCode, error: e?.message || String(e) });
      }
    }

    return { count: results.length, results };
  },
});

