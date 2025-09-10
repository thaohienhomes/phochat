# PayOS Release Rollout Guide (v0.1.0)

This guide covers environment setup and smoke testing for the PayOS integration.

## 1) Environment checklist

Set these variables in your deployment environment (and `.env.local` for local dev):

- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`
- `NEXT_PUBLIC_CONVEX_URL` (Convex HTTP URL)
- `ADMIN_RECONCILE_TOKEN` (shared secret for admin reconcile)

Confirm other existing envs are set: Clerk, Convex, AI Gateway, Sentry (if used).

## 2) PayOS dashboard configuration

- Configure webhook URL to your deployment:
  - `https://<your-domain>/api/payos/webhook`
- If using a custom return route, ensure your app links/redirects to `/payos/return` with any desired `redirect` param.

## 3) Local development

- Expose your dev server (e.g., `localhost:3000`) via a tunnel (ngrok or cloudflared) to receive PayOS callbacks.
- Point PayOS webhook to `https://<tunnel>/api/payos/webhook`.
- Use test orders; watch server logs for webhook verification and status updates.

## 4) Smoke tests (production or preview)

1. Checkout page
   - Go to `/checkout` and create a PayOS order (e.g., 10,000 VND; update description as needed).
   - You should be redirected to PayOS; a small pending notice appears before redirect.
2. Complete the payment
   - Follow instructions in PayOS (QR / Napas 24/7).
3. Return page status
   - After completing/aborting, you should land at `/payos/return`.
   - The page polls `/api/payos/status?orderCode=...` and will display `succeeded`, `failed`, or remain `pending` until webhook arrives.
   - Success auto-redirects back if a `redirect` param was provided.
4. Orders UI
   - Visit `/orders` and confirm the new order appears with the correct status and amount.
5. Webhook idempotency
   - If PayOS retries, the event is deduplicated; order status should not flap.

## 5) Admin reconcile (restricted)

- Endpoint: `POST /api/payos/admin/reconcile`
- Header: `x-admin-token: <ADMIN_RECONCILE_TOKEN>`
- Body (optional): `{ "olderThanMs": 900000 } // default 15 min`

Example:

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_RECONCILE_TOKEN" \
  -d '{"olderThanMs": 900000}' \
  https://<your-domain>/api/payos/admin/reconcile
```

## 6) Troubleshooting

- Webhook not arriving:
  - Verify the webhook URL and that your server is reachable (check host/firewall/CDN)
  - Check server logs for verification errors; ensure `PAYOS_*` envs are set
- Status stuck on `pending`:
  - The order only flips to `succeeded` upon webhook confirmation
  - Confirm PayOS sent the callback and SDK verification succeeded
- Admin reconcile 401:
  - Ensure header `x-admin-token` matches `ADMIN_RECONCILE_TOKEN`

## 7) References

- Docs: `pho-chat/docs/payos.md`
- Release notes: `CHANGELOG.md` and GitHub Releases v0.1.0
- Official PayOS docs: https://payos.vn/docs/sdks/intro

