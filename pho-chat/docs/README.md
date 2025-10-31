# pho-chat Docs Portal

Welcome! This portal ties together design, tokens, Storybook, and engineering docs for quick onboarding and easy navigation.

## Quick Start

- Run the app locally as usual (see project README at repo root)
- Tokens & Storybook helpers (from repo root):
  ```bash
  cd pho-chat
  # Generate native RGB tokens + Storybook token MDX from figma-tokens.json
  npm run tokens:convert-all

  # Initialize Storybook (first time only)
  npm run storybook:init
  # Start Storybook
  npm run storybook
  # Build static Storybook
  npm run storybook:build
  ```

## Design System & Tokens

- Figma Tokens (source of truth)
  - docs/design/figma-tokens.json
  - docs/design/figma-components.json (component property blueprints)
- Tokens Studio How-To (Figma):
  - docs/design/tokens-studio.md
- Native tokens (generated)
  - docs/design/tokens.ios.rgb.json
  - docs/design/tokens.android.rgb.json
- Token converter & generator scripts
  - scripts/convert-oklch.js (OKLCH → HEX)
  - scripts/generate-token-mdx.js (generate Storybook MDX preview from tokens)
- Runtime CSS variables (web)
  - src/app/globals.css (semantic tokens via CSS variables)
  - docs/design/tokens.css (exported CSS tokens)

## Storybook Docs (MDX)

- docs/storybook/README.md (how to run)
- Foundations
  - Foundations/Index
  - Foundations/Colors (Live CSS Vars)
  - Foundations/Tokens (Live CSS Vars Overview)
  - Foundations/GeneratedTokens (from figma-tokens.json)
  - Foundations/Typography
- Components
  - Button, Input, Textarea, Card, Dialog, DialogContent, Sheet, SheetContent, DropdownMenuItem, SelectTrigger, TooltipProvider, Toast

## Payments (PayOS)

- docs/payos.md — Integration guide (env vars, endpoints, webhook behavior)
  - Server SDK wrapper: src/lib/payos.ts (uses @payos/node)
  - Webhook verification: src/lib/payosWebhook.ts (+ tests)
  - Next.js routes: src/app/api/payos/*, checkout create-order flow
  - Convex models: convex/orders.ts, convex/payos.ts, convex/reconcile.ts, convex/schema.ts

## Rollout & Migrations

- docs/rollout.md — notes for deployment and rollout phases
- docs/migrations/ — migration notes (if any)

## CI / Automation

- Tokens conversion artifacts: .github/workflows/tokens-convert.yml
- Staleness check (optional enforcement): .github/workflows/tokens-stale-check.yml
- Auto-labeling for docs/design/scripts changes: .github/workflows/labeler.yml + .github/labeler.yml
- CODEOWNERS: .github/CODEOWNERS
- PR template: .github/pull_request_template.md

## Useful Commands (from repo root)

```bash
# Convert tokens to RGB + generate Storybook token MDX
npm --prefix pho-chat run tokens:convert-all

# Run Storybook locally (after init)
npm --prefix pho-chat run storybook

# Build Storybook static site
npm --prefix pho-chat run storybook:build
```

## Conventions

- Prefer semantic tokens (primary, accent, muted, etc.) over hard-coded hex
- Keep design docs and tokens under docs/design and docs/storybook
- Update figma-tokens.json as the single source of truth for tokens; commit generated RGB files if you want the staleness check to enforce sync

## Questions?

Open an issue or ping the code owner listed in CODEOWNERS. Happy building!



## Contributing to Docs

- Authoring
  - Prefer MDX under `pho-chat/docs/storybook/**` for UI docs; plain Markdown under `pho-chat/docs/**` for engineering notes.
  - Keep examples short; link to source when possible.
- Tokens workflow
  - Update `figma-tokens.json` when changing tokens; run `npm --prefix pho-chat run tokens:convert-all`.
  - Commit `.rgb.json` outputs if you want staleness to be enforced.
- PR hygiene
  - The PR template includes a tokens/design checklist — please tick items that apply.
  - PRs touching docs/design/scripts auto-label with `documentation`, `design-system`, and/or `tokens`.
- Review
  - CODEOWNERS will auto-request a reviewer for docs/design/scripts changes.
- Storybook deploys
  - PRs build Storybook and upload an artifact named `storybook-static`.
  - Merges to `main` auto-deploy Storybook to GitHub Pages.


## CI / Previews

- Chromatic visual regression (PRs)
  - Workflow: `.github/workflows/chromatic.yml`
  - Requires repo secret: `CHROMATIC_PROJECT_TOKEN`
  - Uploads your built Storybook and runs visual diffs
- Storybook Preview on Vercel (PRs)
  - Workflow: `.github/workflows/storybook-vercel.yml`
  - Requires repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  - Builds Storybook and deploys a preview URL per PR
- GitHub Pages (main)
  - Workflow: `.github/workflows/storybook-pages.yml`
  - Deploys Storybook static site on merges to `main`


- More details:
  - Chromatic setup: docs/ci/chromatic.md
  - Vercel Storybook preview: docs/ci/vercel-storybook.md
