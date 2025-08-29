// App-level types for Convex data shapes

export type UUID = string;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  createdAt: number; // epoch millis
};

export type ChatSession = {
  _id: string; // Convex document id (TableId)
  user_id: UUID;
  messages: ChatMessage[];
  model: string; // e.g. "gpt-4o-mini" or similar
  created_at: number;
};

export type Subscription = {
  _id: string;
  user_id: UUID;
  tier: string;
  expiry: number;
  receipts: unknown;
};

export type Payment = {
  _id: string;
  user_id: UUID;
  amount: number;
  status: string;
  provider: string;
  created_at: number;
};

