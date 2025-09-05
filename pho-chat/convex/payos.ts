import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Orders table will be stored in existing `payments` for now? Prefer a dedicated table; but keep minimal.
// We'll add a minimal orders table-like behavior using payments with provider "payos" and an orderCode.

export const createOrUpdateOrder = mutation({
  args: {
    orderCode: v.number(),
    amount: v.number(),
    status: v.string(),
    userId: v.optional(v.string()), // Clerk user id
  },
  handler: async (ctx, { orderCode, amount, status, userId }) => {
    // Store a payment row keyed by orderCode in receipts
    const existed = await ctx.db
      .query("payments")
      .withIndex("by_created")
      .collect();

    const existing = existed.find((p: any) => p.provider === "payos" && p.receipts?.orderCode === orderCode);

    if (existing) {
      await ctx.db.patch(existing._id, { status, amount });
      return existing._id;
    }

    return await ctx.db.insert("payments", {
      user_id: userId ?? "",
      amount,
      status,
      provider: "payos",
      created_at: Date.now(),
      receipts: { orderCode },
    } as any);
  },
});

export const markPaidByOrderCode = mutation({
  args: { orderCode: v.number() },
  handler: async (ctx, { orderCode }) => {
    const rows = await ctx.db.query("payments").withIndex("by_created").collect();
    const row = rows.find((p: any) => p.provider === "payos" && p.receipts?.orderCode === orderCode);
    if (row) {
      await ctx.db.patch(row._id, { status: "succeeded" });
      return row._id;
    }
    return null;
  },
});



export const statusByOrderCode = query({
  args: { orderCode: v.number() },
  handler: async (ctx, { orderCode }) => {
    const rows = await ctx.db.query("payments").withIndex("by_created").collect();
    const row = rows.find((p: any) => p.provider === "payos" && p.receipts?.orderCode === orderCode);
    if (!row) return { status: "not_found" };
    return { status: row.status, amount: row.amount, orderCode };
  },
});
