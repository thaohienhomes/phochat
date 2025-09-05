---
type: "manual"
---

payOS Integration Rules & Developer Guide
Integration Rules
SDK Usage:
Only use the official PayOS SDK (@payos/sdk) https://payos.vn/docs/sdks/intro for all integration tasks (API calls, webhook verification). Do not implement custom signing or make direct REST calls unless required by official docs for features not exposed via SDK.

Credential Security:
All PayOS credentials (clientId, apiKey, checksumKey) must be provided via environment variables. Never hardcode or commit sensitive keys into the codebase.

Payment Status Updates:

Mark orders as “Paid” or “Complete” only after a valid, verified webhook from PayOS is received.

Payments completed via returnUrl on the client are for user display only—do not update backend payment status based on the client redirect alone.

Webhook Verification:
The webhook endpoint must always verify the authenticity of incoming payloads using the SDK’s signature verification methods.
Reject any webhook if verification fails.

Error Handling:
Never log sensitive information such as API keys or checksums.
Always add code comments at points interacting with PayOS APIs or handling webhooks.

Required Environment Variables
Set these variables in .env.local, your deployment environment, or CI/CD secrets:

text
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
PAYOS_RETURN_URL=https://yourapp.com/payment/success
PAYOS_CANCEL_URL=https://yourapp.com/payment/cancel
Do NOT commit real credentials to the repo.

Integration Flow
Create Payment Link
Use payos.createPaymentLink or equivalent SDK method to generate a checkout link/QR with the necessary order details.

Display QR/Checkout Link
Render the QR or redirect the user to PayOS’s checkout.

Handle returnUrl
This shows the user their payment result, but do not update the backend order based solely on this.

Webhook Handling
Implement a /webhook/payos endpoint:

Use SDK to verify webhook payload.

If valid and payment is successful, update the corresponding order as “paid”.

Respond with 200 OK or as documented for PayOS.

Testing & QA Checklist
 Payment creation returns a valid checkout URL.

 QR renders and is scannable via app/Mobile Banking.

 Payment status on frontend correctly reflects PayOS’s returnUrl state.

 Order is only marked paid in backend after validated webhook.

 Webhook endpoint correctly rejects invalid or forged requests.

 No credentials or secrets are logged or leaked.

 Environment variables well documented for all stages.

References
PayOS SDK Docs: https://payos.vn/docs/sdks/intro

API Reference: https://payos.vn/docs/apis/

Webhook docs: https://payos.vn/docs/docs/webhook

Payment Flow Overview: https://payos.vn/docs/docs/huong-dan-tich-hop/luong-hoat-dong

