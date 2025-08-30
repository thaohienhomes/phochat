import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex automatically manages the `id` primary key for each table.
// We approximate the requested SQL-like schemas using Convex's types.
export default defineSchema({
  chat_sessions: defineTable({
    user_id: v.string(), // UUID string
    messages: v.any(), // JSON-serializable array of messages
    model: v.string(),
    created_at: v.number(), // epoch millis
  }).index("by_user", ["user_id"]).index("by_created", ["created_at"]),

  subscriptions: defineTable({
    user_id: v.string(), // UUID string; unique per user (enforced in code)
    tier: v.string(), // e.g. "free" | "pro"
    expiry: v.number(), // epoch millis
    receipts: v.any(),
  }).index("by_user", ["user_id"]),

  payments: defineTable({
    user_id: v.string(), // UUID string
    amount: v.number(),
    status: v.string(), // e.g. "pending" | "succeeded" | "failed"
    provider: v.string(), // e.g. "revenuecat" | "qr"
    created_at: v.number(),
  }).index("by_user", ["user_id"]).index("by_created", ["created_at"]),
});

