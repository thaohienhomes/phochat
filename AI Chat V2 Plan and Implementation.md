# AI Chat V2 Plan and Implementation

## 1) Executive Summary
- Objective: Migrate pho.chat homepage (/) to a high‑fidelity Shadcn AI Chat v2 UI while preserving existing Convex/Clerk backend, streaming, and PayOS flows.
- Approach: Introduce a shell-based layout (header, sidebar, main, composer), reuse owned shadcn/ui components, copy the “AI” building blocks for messages/responses, and wire to current APIs.
- Non-goals: Major backend rework or replacing Convex persistence in this pass.

## 2) Phase Plan, Tasks, Dependencies, Deliverables

### Phase 1 — Shell and base components
- Tasks
  - Create ChatShell (Header, SidebarContainer, Main, ComposerContainer) scaffold
  - Add mobile drawer + desktop collapsible sidebar primitives
  - Implement basic theme tokens and layout scaffolding; ensure accessible focus/skip links
- Dependencies: shadcn/ui (existing), Tailwind v4 tokens, global styles
- Deliverables
  - Homepage renders new shell on “/”
  - Smoke tests: render ChatShell, sidebar toggles, mobile drawer mounts

### Phase 2 — Chat logic migration into new shell
- Tasks
  - Map existing chat state and streaming to “Message”, “Response”, “Prompt Input” building blocks
  - Preserve keyboard shortcuts (Enter submit, Ctrl/Cmd+Enter newline), stop/cancel, copy, new chat
  - Wire empty, loading, error, retry, and “suggested prompts” states
- Dependencies: Existing streaming endpoints; Convex queries/mutations; Clerk auth
- Deliverables
  - Functional parity with current /chat experience, under new UI on “/”
  - Console-log-free, error-handled streaming flows

### Phase 3 — Sidebar/history + responsiveness
- Tasks
  - Recent sessions list from Convex; rename/delete actions; loading skeletons
  - New chat flow starts a new session, updates sidebar
  - Fine-tune mobile drawer behavior and keyboard focus loops
- Dependencies: Convex session model; Clerk user state
- Deliverables
  - Fully functional sidebar on desktop and mobile; history navigation is smooth

### Phase 4 — Visual polish, animations, edge cases
- Tasks
  - Align radii/spacing/opacity to reference; introduce subtle enter/typing transitions
  - Improve empty state visuals and “resume last session” affordance
  - A11y pass (labels, roles, aria-live for streaming)
- Dependencies: Design tokens; brand assets; minor CSS utilities
- Deliverables
  - 95–99% visual parity; final pass items documented explicitly

## 3) Risk Assessment and Mitigations
- Styling drift vs reference
  - Mitigation: Design snapshot checklist (spacing, radii, font sizes, colors) and fix variances during Phase 4
- Mobile interactions (drawer/keyboard focus)
  - Mitigation: Radix primitives + focus management; test on iOS/Android
- Streaming regressions
  - Mitigation: Keep endpoint contract unchanged; add integration smoke tests; Sentry logs
- Scope creep
  - Mitigation: Defer to Enhancements, keep MVP timeline stable
- Performance regressions
  - Mitigation: Consider virtualization for very long histories; lazy load media; memoized message rows

## 4) Testing Checklist and QA Procedures
- Component tests
  - Shell renders in light/dark, with/without auth
  - Sidebar toggles; drawer open/close; focus trap works
- Interaction tests
  - Enter submit; Ctrl/Cmd+Enter newline
  - Stop/Retry/New Conversation flows
- Integration tests
  - Streaming roundtrip (client -> API -> stream back)
  - Session load/save with Convex; history navigation
- Accessibility checks
  - aria-live for streaming; focus management; keyboard-only navigation
- Visual checks
  - Compare key screens to reference (desktop, tablet, mobile) with a spacing/radii checklist
- Observability
  - Console clean; Sentry breadcrumb + error logging in chat actions

## 5) Timeline (3–4 days)
- Day 1 — M1: Shell & layout on “/”; mobile drawer + desktop sidebar scaffolding
- Day 2 — M2: Chat message rendering + streaming in new UI; keyboard shortcuts; basic empty/loading/error states
- Day 3 — M3: Sidebar history wired; rename/delete; responsiveness polish; a11y pass
- Day 4 — M4: Visual parity adjustments, micro-animations, QA checks, stabilization

## 6) Success Criteria & Approval
- ChatGPT-like interface renders on homepage with no regressions
- ≥95% visual match to Shadcn AI Chat v2 reference
- Smooth mobile/desktop UX with working sidebar and responsive behavior
- Critical chat flows pass QA checklist; no console errors
- Approval: walkthrough with screenshots/video; one iteration of tweaks before final sign-off

## 7) Resource Requirements
- Brand assets: logo SVG, preferred accent theme
- Design decisions: default sidebar width; session naming rules; composer actions (attachments/tools) if any
- Optional: Spacing/radius tokens if different from current Tailwind v4 tokens

## 8) AI SDK Integration Analysis (Summary)
- Sources:
  - AI SDK Core: https://ai-sdk.dev/docs/introduction
  - AI Elements: https://ai-sdk.dev/elements/overview

### 8.1 Component Strategy — AI Elements vs shadcn.io/ai
- AI Elements
  - Pros: Complete, composable components (Conversation, Message, Prompt Input, Sources, etc.) maintained by AI SDK team
  - Cons: Adds a custom registry; potential styling drift from Shadcn AI Chat v2
- shadcn.io/ai building blocks
  - Pros: Closest visual parity; consistent with your owned shadcn components
  - Cons: You own maintenance
- Decision: Use shadcn.io/ai building blocks now for maximum visual fidelity and speed; consider AI Elements later if we pivot to its ecosystem.

### 8.2 Backend Simplification — streamText
- AI SDK Core `streamText` is provider-agnostic and aligns with Vercel AI Gateway.
- Decision: Continue/standardize on `streamText` server-side. Minimal change, flexible for providers.

### 8.3 State Management — useChat vs Convex persistence
- useChat
  - Pros: Great interaction-state ergonomics
  - Cons: Still need Convex for durable history; reconcile lifecycle
- Hybrid is feasible: useChat for UI state + Convex for persistence, but adds 0.5–1d.
- Decision: For MVP speed/low risk, keep existing Convex-backed session/messages and wire the new UI. Revisit useChat later.

### 8.4 Timeline Impact
- Adopt now: AI SDK Core `streamText` server-side (or keep as-is if already used)
- Defer: AI Elements UI kit and full useChat adoption (post-MVP)

## 9) Future Enhancements (Post-MVP)
- Adopt AI SDK UI `useChat` for cleaner client state
- Message-level tool-calls UI and “Sources” blocks
- Virtualized message list for long histories
- Theme presets switcher for marketing experiments

