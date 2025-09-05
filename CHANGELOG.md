# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2025-09-05

MVP hardening + PayOS integration

### Added
- PayOS payment link/QR flow using `@payos/node` SDK
  - Server: create payment link (`POST /api/payos/create`)
  - Client: return page `/payos/return` with pending/success/failure states
  - Server: secure webhook (`POST /api/payos/webhook`) with SDK verification + idempotency store
  - Server: status endpoint (`GET /api/payos/status?orderCode=...`)
  - UI: `/orders` and `/orders/[id]` pages
- Admin reconcile endpoint `POST /api/payos/admin/reconcile`
  - Secured via `x-admin-token` header (`ADMIN_RECONCILE_TOKEN`)
- Convex schema & logic
  - `users` table and `chat_sessions.user_id: Id<"users">`
  - `orders` and `payos_events` tables + indexes; `payments.receipts`
- Security / Hardening
  - Ownership checks, model allowlist, basic API rate limiting
  - RevenueCat webhook HMAC verification
- Docs
  - `pho-chat/docs/payos.md` covering env, endpoints, flow, idempotency, local tips
- Tests
  - Unit tests for webhook hashing/status and route-level idempotency

### Changed
- Checkout UI shows a pending notice while redirecting to PayOS

### Notes
- Official Node SDK used: `@payos/node` (per PayOS docs). `@payos/sdk` not on npm at integration time.

[v0.1.0]: https://github.com/thaohienhomes/phochat/releases/tag/v0.1.0

