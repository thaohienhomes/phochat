import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex automatically manages the `id` primary key for each table.
export default defineSchema({
  // Canonical users table (linked to Clerk)
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), // Clerk token identifier
    clerkUserId: v.string(), // Clerk user.id
    tier: v.string(), // "free" | "pro" | "team"
  })
    .index("by_token", ["tokenIdentifier"]) // pseudo-unique
    .index("by_clerk", ["clerkUserId"]),

  chat_sessions: defineTable({
    user_id: v.id("users"), // FK to users table
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.string(),
        content: v.string(),
        createdAt: v.number(),
      })
    ),
    model: v.string(),
    created_at: v.number(), // epoch millis
  })
    .index("by_user", ["user_id"]) // list sessions for a user
    .index("by_created", ["created_at"]),

  // Keep subscription/payment ledgers keyed by external Clerk id for now
  subscriptions: defineTable({
    user_id: v.string(), // Clerk user id
    tier: v.string(), // e.g. "free" | "pro"
    expiry: v.number(), // epoch millis
    receipts: v.any(),
  }).index("by_user", ["user_id"]),

  payments: defineTable({
    user_id: v.string(), // Clerk user id
    amount: v.number(),
    status: v.string(), // e.g. "pending" | "succeeded" | "failed"
    provider: v.string(), // e.g. "revenuecat" | "qr"
    created_at: v.number(),
  })
    .index("by_user", ["user_id"]) // list payments for a user
    .index("by_created", ["created_at"]),
});

