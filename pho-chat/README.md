This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the Convex dev server once to generate client code and push schema/functions:

```bash
# From the project root (the folder with package.json)
cd pho-chat
npx convex dev
```

Then run the Next.js dev server:

```bash
npm run dev
```


## Environment variables

Copy `.env.example` to `.env.local` for development and fill values. Do NOT commit `.env.local`.

Essential keys:
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_ISSUER_DOMAIN`
- Convex: `NEXT_PUBLIC_CONVEX_URL`
- Vercel AI Gateway: `AI_GATEWAY_BASE_URL` (recommended `https://ai-gateway.vercel.sh/v1`), `AI_GATEWAY_KEY`
- PayOS: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
- Sentry (observability):
  - `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` (DSN is not a secret)
  - `SENTRY_ENVIRONMENT` (e.g. development, preview, production)
  - `SENTRY_DEBUG` (true in dev, false in prod)
  - `SENTRY_TRACES_SAMPLE_RATE`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` (tune per env)
  - `ENABLE_SENTRY_DEV_TOOLS` (set to `1` only in dev to enable `/dev/sentry` and helper API routes)

Recommended values:
- Development
  - `SENTRY_ENVIRONMENT=development`
  - `SENTRY_DEBUG=true`
  - `ENABLE_SENTRY_DEV_TOOLS=1`
  - `SENTRY_TRACES_SAMPLE_RATE=0.1`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0`
- Production
  - `SENTRY_ENVIRONMENT=production`
  - `SENTRY_DEBUG=false`
  - Do NOT set `ENABLE_SENTRY_DEV_TOOLS`
  - Tune sampling according to traffic/error budgets

See `.env.example` for a comprehensive list and comments.

## Sentry dev tools

In development, when `ENABLE_SENTRY_DEV_TOOLS=1` is set, you can visit `/dev/sentry` to:
- Send a client error to Sentry
- Send a server error to Sentry (calls `/api/sentry-capture`)
- Open quick links to server diagnostics (`/api/sentry-check`)

These helpers are strictly dev-only: the page and routes return 404 in non‑development or when the flag is not set.


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Routes for Convex testing

Create a chat session:

```bash
curl -X POST http://localhost:3000/api/createChatSession \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","model":"gpt-4o-mini"}'
```

Send a message to a session:

```bash
curl -X POST http://localhost:3000/api/test-sendMessage \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<CONVEX_DOC_ID>","content":"Hello from test"}'
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) and ensure environment variables are set in Vercel.

## Production Setup (PayOS + Email + Sentry)

Follow this checklist to prepare a stable production deployment.

1) Configure environment variables (Vercel → Project Settings → Environment)
- PayOS
  - PAYOS_CLIENT_ID
  - PAYOS_API_KEY
  - PAYOS_CHECKSUM_KEY
- Email (Resend)
  - RESEND_API_KEY
  - EMAIL_FROM (e.g., "Pho.Chat <noreply@pho.chat>")
- Convex
  - NEXT_PUBLIC_CONVEX_URL (prod deployment URL)
- App URLs
  - NEXT_PUBLIC_BASE_URL (e.g., https://yourdomain.com)
- Observability
  - SENTRY_DSN (and optional NEXT_PUBLIC_SENTRY_DSN)
  - SENTRY_ENVIRONMENT=production
  - SENTRY_DEBUG=false
  - SENTRY_TRACES_SAMPLE_RATE and NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE (tune as needed)
- Admin ops
  - ADMIN_RECONCILE_TOKEN (already set per project notes)

2) Set PayOS webhook URL (in PayOS dashboard)
- Webhook: https://YOUR_DOMAIN/api/payos/webhook
- The app verifies signatures with the official SDK and uses idempotency to avoid duplicates.

3) Return/Cancel URLs for checkout
- The checkout create route composes return/cancel using your site base URL.
- Ensure NEXT_PUBLIC_BASE_URL reflects the production domain.

4) Smoke test after deploy
- Create a small-amount test order, complete via QR.
- Verify:
  - User sees pending state on return, then success after refresh/polling.
  - Webhook marks order succeeded/failed.
  - Success/failure email is recorded in Admin · Emails and delivered.
  - Sentry shows breadcrumbs with no unexpected errors.

5) Local/dev reference
- Copy .env.example → .env.local and fill values for local testing.
- For local webhook tests, expose the dev server with a tunnel and point PayOS to /api/payos/webhook.



Production deploy trigger 4.
\nNote: ensure NEXT_PUBLIC_CONVEX_URL is set on Vercel for createChatSession to work in Preview.


## PayOS local development (webhook)

PayOS must call your app's webhook on a public URL. When running locally, expose the dev server with a tunnel and register the webhook URL.

1. Start Next.js dev (Turbopack may choose port 3001 if 3000 is taken):
   - `npm run dev`
2. Start a tunnel (choose one):
   - Ngrok: `ngrok http 3001`
   - Cloudflare: `cloudflared tunnel --url http://localhost:3001`
3. Copy the public URL and confirm the webhook with the SDK via our helper route:
   - `curl -X POST https://<public-url>/api/payos/confirm -H "Content-Type: application/json" -d '{"webhookUrl":"https://<public-url>/api/payos/webhook"}'`

Notes:
- You can also configure the webhook URL in the PayOS dashboard.
- Payment state is marked paid only after PayOS posts to `/api/payos/webhook` and the SDK verifies the signature.
- The return page `/payos/return` shows a polling UI that queries `/api/payos/status?orderCode=...` every 3s.


### Orders + Webhook (production)

- Convex tables:
  - orders: user_id, amount, currency, status, provider, orderCode, paymentLinkId, checkoutUrl, description, metadata, created_at, updated_at
  - payos_events: event_hash, orderCode, received_at, payload (for idempotency)
- Webhook: /api/payos/webhook
  - Verifies via SDK, records event idempotently, transitions orders to succeeded/failed
- Checkout create: /api/checkout/create-order
  - Creates/reuses pending order, calls PayOS, attaches checkout info, returns checkoutUrl
- Status polling: /api/payos/status?orderCode=...
- Reconcile: POST /api/payos/admin/reconcile { olderThanMs?: number }

Operational tips
- Confirm webhook URL in each environment (use /api/payos/confirm or dashboard)
- Monitor:
  - webhook 4xx/5xx rates
  - orders pending > 15m
- Secrets required: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_BASE_URL (optional)
