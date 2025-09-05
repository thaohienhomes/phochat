import type { Id } from "../../convex/_generated/dataModel";

// Cast helpers for branded Convex Id types.
// Use sparingly at boundaries where Ids arrive as strings (URLs / API payloads).
export function toChatSessionId(id: string): Id<"chat_sessions"> {
  return id as unknown as Id<"chat_sessions">;
}

