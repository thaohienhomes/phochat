---
type: "manual"
---

# pho.chat Project Documentation


***

## 1. Vision \& Objectives

**pho.chat** is an AI-powered multilingual chat assistant and answer engine optimized for Vietnamese and global audiences. It offers real-time, multi-model conversations via web and mobile, seamless subscription management, QR-code payment, and rapid deployment for indie founders using AI coding tools.

***

## 2. Business Model \& Pricing

### 2.1 Subscription Tiers

| Tier | Price (VND/month) | USD Approx. | Limits \& Features |
| :-- | :-- | :-- | :-- |
| Free | 0 | 0 | 600 msgs/mo; 2–3 basic models; no history save; Vietnamese/English |
| Pro | 199 000 | 8 | Unlimited msgs (fair use); 10+ premium models; chat history; export; priority support |
| Team | 499 000 | 20 | 5 seats; API access; analytics; admin dashboard; VAT invoice |

### 2.2 Payment Flow

- **Web \& Mobile**: RevenueCat manages subscriptions across platforms.
- **Vietnam QR Payment**: Generate VietQR (VNPay/MoMo/ZaloPay) at checkout; webhook updates via Convex; redemption deep-link unlocks features in app.
- **International**: Stripe, Apple Pay, Google Pay managed by RevenueCat.

***

## 3. Tech Stack

### 3.1 Frontend

- **Web**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Mobile**: Expo (React Native) + Expo Router + shared component library


### 3.2 Backend \& Real-Time

- **Database \& Functions**: Convex (TypeScript functions, real-time streaming)
- **AI**: Vercel AI Gateway + AI SDK (streaming, multi-model)


### 3.3 Auth \& Subscriptions

- **Auth**: Convex Auth or Clerk integration
- **Subscriptions**: RevenueCat Web SDK + Expo SDK


### 3.4 Payments

- **Vietnam**: VietQR via `vietnam-qr-pay` library
- **Global**: Stripe via RevenueCat integration


### 3.5 Internationalization

- **i18next** shared across web/mobile for Vietnamese/English (future SEA languages)

***

## 4. Product Requirements (PRD)

### 4.1 Core Features

1. **Real-Time Chat**
    - Multi-model selection (GPT-4o, Claude 3.5, Llama 3.3…)
    - Word-by-word streaming, persistent across refresh/tab
2. **Subscription Management**
    - Free, Pro, Team tiers via RevenueCat
    - Automatic cross-platform sync
3. **QR Code Payment**
    - Web checkout generates VietQR
    - Payment webhook triggers access unlock on mobile/web
4. **Multilingual UI**
    - Vietnamese + English, auto-detect \& user-switchable
5. **Chat History \& Export**
6. **Admin Dashboard** (Team tier)

### 4.2 UX \& Flows

- **Onboarding**: Language \& account selection → choose tier → setup payment
- **Chat Screen**: Model selector, message list, input box, streaming indicator
- **Subscription Screen**: Tier details, subscribe/unsubscribe, manage seats (Team)
- **QR Payment Flow**: “Pay with QR” button → display QR code modal → scan \& confirm → unlock UI
- **Settings**: Language switch, account info, billing history

***

## 5. Feature Ideation \& Roadmap

| Phase | Duration | Deliverables |
| :-- | :-- | :-- |
| MVP Web | 4 weeks | Web chat, Convex real-time, AI streaming, Free/Pro subscribe, QR payment, Vi/En i18n |
| Mobile Beta | 4–6 weeks | Expo app with chat, RevenueCat sync, QR redemption, Vi/En i18n |
| Admin \& Team | 3 weeks | Admin dashboard, Team tier seat management, analytics |
| Optimization | 3 weeks | Performance tuning, OCR QR improvements, edge caching |
| Launch Prep | 2 weeks | Store submissions, marketing assets, user testing |


***

## 6. Screen Wireframes \& App Flow

1. **Landing Page (Web)**
    - Header: Logo, Nav (Chat, Pricing, Docs)
    - Hero: Chat preview, CTA “Start Free”
    - Features section
2. **Chat UI (Web/Mobile)**
    - Top bar: Language switch, subscription status
    - Model selector dropdown
    - Message list with streaming indicator
    - Input area with “Send”
3. **Subscription Modal**
    - Tier cards, pricing, “Subscribe” buttons
    - QR code popup for VietQR
4. **Settings Screen**
    - Profile info, billing history table, logout
5. **Admin Dashboard**
    - User list with tier, usage stats
    - Analytics graphs

_App Flow Diagram_
User lands → Onboard → Chat screen → Open subscription → QR payment → Access unlock → Chat → Settings

***

## 7. Design Description

- **Style**: Minimal, modern, high-contrast dark/light mode
- **Components**: shadcn/ui primitives with Tailwind theming
- **Icons**: Lucide icons for clarity
- **Colors**: Primary (\#3B82F6), Secondary (\#10B981), Neutral grays
- **Typography**: Inter variable font

***

## 8. Implementation Plan \& Technical Specifications

### 8.1 Project Structure

```
pho-chat/
├── apps/
│   ├── web/         # Next.js app
│   └── mobile/      # Expo app
├── packages/
│   ├── ui/          # Shared components
│   ├── convex/      # DB schema & functions
│   ├── payments/    # QR & RevenueCat logic
│   ├── ai/          # AI Gateway wrappers
│   └── i18n/        # Translations
└── docs/            # This spec
```


### 8.2 API \& Data Models

- **Convex Tables**

```sql
chat_sessions(id, user_id, messages JSONB, model, created_at)
subscriptions(user_id, tier, expiry, receipts JSONB)
payments(id, user_id, amount, status, provider, created_at)
```

- **Convex Functions**
    - `sendMessage` (mutation): insert message
    - `fetchHistory` (query): paginated session fetch
    - `handleWebhook` (mutation): subscription \& payment sync
- **AI SDK**

```ts
import { streamText } from 'ai';
const response = await streamText({ model: 'openai/gpt-4o', messages });
```

- **RevenueCat Web SDK**

```ts
import Purchases from 'purchases-js';
Purchases.configure({ apiKey: 'REVENUECAT_API_KEY', appUserID: user.id });
```

- **QR Payment**

```ts
import { initVietQR } from 'vietnam-qr-pay';
const qr = initVietQR({ amount, bankBin, content });
```


***

## 9. English Prompts for Augmentcode Implementation

1. “Initialize a Next.js 15 + TypeScript project named ‘pho-chat’, integrate shadcn/ui and Tailwind, and configure Vercel deployment.”
2. “Configure Convex in the Next.js project: create tables for chat_sessions, subscriptions, payments, and implement sendMessage and handleWebhook functions.”
3. “Implement a real-time chat screen with model selector and streaming using Vercel AI Gateway streamText API.”
4. “Set up RevenueCat Web SDK in the web app for Free/Pro/Team tiers, and handle subscription webhooks to Convex functions.”
5. “Add Vietnamese QR payment flow on web: generate VietQR code, process payment, and update unlock status via Convex webhook.”
6. “Create a React Native + Expo universal app sharing UI components: chat screen, subscription modal, settings, using Convex and Vercel AI Gateway.”
7. “Integrate RevenueCat Expo SDK for mobile subscriptions and ensure cross-platform sync with RevenueCat web billing.”
8. “Implement i18next for Vietnamese and English text in both web and mobile, auto-detect language and allow manual switching.”
9. “Build Admin dashboard in Next.js for Team tier: list users, usage analytics graphs, and seat management.”
10. “Configure CI/CD on Vercel and EAS for Expo, set up environment variables, and deploy web and mobile preview builds.”

***

This consolidated documentation provides vision, business rules, tech stack, features, flows, design guidance, implementation plan, technical specs, and clear AI prompts to guide your no-code and AI-driven development. Good luck building pho.chat!

