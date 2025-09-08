# PayOS Integration Guide

This document summarizes configuration and operations for the PayOS payment flow.

## Environment variables

Set these in your deployment (and `.env.local` for local dev):

- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`
- `NEXT_PUBLIC_BASE_URL` (public site origin used to compose return/cancel URLs)
- `NEXT_PUBLIC_CONVEX_URL` (Convex HTTP URL)
- `ADMIN_RECONCILE_TOKEN` (shared secret to protect admin endpoints)
- `CRON_SECRET` (optional but recommended; Vercel Cron will send Authorization: Bearer `$CRON_SECRET`)

## Key endpoints

- Create payment link/QR (server): `POST /api/payos/create`
- Return URL (client): `/payos/return`
- Webhook (server): `POST /api/payos/webhook`
- Status (server): `GET /api/payos/status?orderCode=123`
- Admin reconcile (server): `POST /api/payos/admin/reconcile`
  - Requires header: `x-admin-token: <ADMIN_RECONCILE_TOKEN>`

## Flow overview

1. Server creates a payment link/QR with PayOS using `@payos/node` and records a pending order in Convex.
2. User is redirected to PayOS checkout (or shown QR in-app).
3. Return URL shows pending/success/failure state. Do not mark paid yet.
4. Webhook is verified via SDK (`payos.webhooks.verify`). On successful event, mark the order `succeeded`.
5. Status endpoint + client polling updates the UI as webhook arrives.

## Webhook idempotency

- Event hash is computed from verified payload and stored in `payos_events`.
- Duplicate events are detected and ignored safely.

## Local development

- Expose your local server (e.g. `localhost:3000`) via a tunnel (ngrok, cloudflared) to receive PayOS webhooks.
- Configure the webhook URL in PayOS dashboard to your tunnel: `https://<tunnel>/api/payos/webhook`.
- Use test orders; monitor server logs for webhook processing.

## Admin reconcile

- Reconciling marks stale pending orders by re-checking with business logic in Convex action.
- Only call with `x-admin-token` matching `ADMIN_RECONCILE_TOKEN`.

## Notes

- Official Node SDK used: `@payos/node` (docs: https://payos.vn/docs/sdks/intro)
- Swapping to a different SDK in the future is isolated to `src/lib/payos.ts`.


## Scheduled reconcile (production)

- Endpoints:
  - POST /api/payos/admin/reconcile-cron (Authorization header or x-admin-token)
  - GET  /api/payos/admin/reconcile-cron (Authorization header or x-admin-token)
- Default: marks orders pending for >15 minutes as expired (idempotent)
- Suggested schedule: every 30 minutes via Vercel Cron

Example (POST curl):

```
curl -X POST \
  -H "x-admin-token: $ADMIN_RECONCILE_TOKEN" \
  https://<your-domain>/api/payos/admin/reconcile-cron
```

### Vercel Cron setup (vercel.json)

Add `vercel.json` to the project root (already included in this repo) and deploy. Vercel will register the job automatically.

```json
{
  "crons": [
    {
      "path": "/api/payos/admin/reconcile-cron",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

Security:
- Set `CRON_SECRET` in Vercel → Project → Settings → Environment Variables.
- Vercel will call the path with `Authorization: Bearer $CRON_SECRET`.
- Our cron route also allows `x-admin-token: ADMIN_RECONCILE_TOKEN` and `?token=...` for manual runs, but using `CRON_SECRET` is recommended.

## Base URL setup

- In development:
  - NEXT_PUBLIC_BASE_URL = your public tunnel (ngrok) for return/polling
  - INTERNAL_BASE_URL = http://127.0.0.1:3000 for internal server-to-server calls
- In production:
  - Set both to your canonical domain

