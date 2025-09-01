# Vercel Setup for phochat/pho-chat

Follow these steps to enable automatic PR Preview deployments and a Production deployment on `main`.

## 1) Install the Vercel GitHub App
- Go to https://vercel.com/integrations/git
- Install the GitHub App and grant access to the repository `thaohienhomes/phochat`

## 2) Import the project
- In Vercel, click "Add New… → Project" and choose the repo `thaohienhomes/phochat`
- Project Name: pho-chat (or any name)
- Root Directory: `pho-chat`
- Framework Preset: Next.js
- Build Command: (default)
- Output Directory: (default)

## 3) Environment Variables
Set the following Environment Variables in Vercel Project → Settings → Environment Variables.

- AI_GATEWAY_BASE_URL = https://ai-gateway.vercel.sh/v1/openai
- AI_GATEWAY_KEY = <your_vck_key>  (Server-side only)
- NEXT_PUBLIC_CONVEX_URL = https://beloved-hyena-231.convex.cloud
- ALLOWED_ORIGINS = (optional comma-separated list; leave empty for same-origin only)

Notes:
- Keep AI keys server-side (do not expose in NEXT_PUBLIC_ unless for local dev only)
- If using a different gateway provider, set AI_GATEWAY_BASE_URL accordingly

## 4) Production Branch and PR Previews
- Production Branch: `main`
- Ensure “Create Preview Deployments for Pull Requests” is enabled (default for GitHub)

## 5) Optional checks
- Protect `main` in GitHub (already configured) so merges happen only when CI is green
- After Vercel connects, new PRs will automatically get Preview URLs posted by the Vercel bot

## 6) Local Development
- Copy `pho-chat/.env.example` to `pho-chat/.env.local` and fill real values for local development
- Commands:
  - `cd pho-chat && npm ci`
  - `npm run dev` (http://localhost:3000)

If you prefer, I can paste a one-time link prompt for the Vercel GitHub App here after you confirm Vercel account ownership.

