API routes overview:

- POST /api/createChatSession
  - Creates a chat session for the authenticated user via Convex. Validates `model` against an allowlist.
  - CORS allowlist via `ALLOWED_ORIGINS`.

- POST /api/ai/stream
  - Streams AI responses via Vercel AI SDK with OpenAI provider.
  - Requires AI_GATEWAY_BASE_URL and AI_GATEWAY_KEY when using gateway.

- GET/POST /api/ai/test
  - Lightweight connectivity probe and non-streaming fallback for debugging.

- POST /api/test-sendMessage
  - Helper route to forward a message to Convex sendMessage.

- GET/HEAD /api/health
  - Prints AI gateway connectivity and env presence; HEAD returns 200 for monitors.

