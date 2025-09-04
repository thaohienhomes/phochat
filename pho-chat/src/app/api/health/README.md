This folder contains the health check endpoint for AI Gateway connectivity and environment validation.

- GET /api/health returns environment presence, a connectivity probe to `${AI_GATEWAY_BASE_URL}/models`, and a key preview (redacted).
- HEAD /api/health returns 200 for quick monitors.

