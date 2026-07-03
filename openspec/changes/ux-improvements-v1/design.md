## Context

Brick AI is a property buyer assistant with a Next.js frontend (`BrickAI-frontend-main`) and a FastAPI backend (`brick-api`). The frontend has a landing page with a chat widget, and a logged-in workspace at `/chat` (chat-v2 components). Auth is handled by Supabase via `AuthProvider`. Chat input is in `InputBar.tsx`, auth gating in `AuthGate.tsx` and `LoginPromptBanner.tsx`, and results display in `JourneyCanvas.tsx` / `CanvasModule.tsx`.

These 9 issues are all frontend-focused changes. The backend requires no structural changes — only the source attribution fix (issue #9) may need the API to consistently include `sources` in every suburb response chunk.

## Goals / Non-Goals

**Goals:**
- Fix auth prompt timing so new users see results before being asked to sign up
- Preserve the user's first message across the auth redirect flow
- Add a post-value save CTA that initiates signup
- Make the logged-in `/chat` page visually consistent with the homepage
- Remove "buyer's agent" from all UI copy
- Expand chat input to multi-line auto-grow
- Improve chat message line spacing
- Auto-surface the latest result panel when a new suburb is returned
- Fix source attribution to appear on all suburb results, not just the first

**Non-Goals:**
- Backend refactoring or API versioning
- New AI capabilities or model changes
- Mobile app changes
- Accessibility audit (addressed separately)

## Decisions

### D1 — Defer auth gate to post-result
**Decision**: Show the first AI response in full before triggering `LoginPromptBanner`. Use a message-count or `hasResults` flag in `chat-v2-context` to gate the prompt.
**Alternative considered**: Require auth upfront (current behavior) — rejected because it kills first-run value demonstration.

### D2 — Persist initial message via sessionStorage
**Decision**: Write the user's first message to `sessionStorage` before auth redirect. `SessionTransfer.tsx` (already exists) or a new `usePreservedMessage` hook reads it back after login and replays it.
**Alternative considered**: Pass message as a URL query param — rejected due to length limits and ugly URLs.

### D3 — Save CTA as inline chat action
**Decision**: After results are shown to an unauthenticated user, render a `SaveResultsBanner` component below the last AI message with copy: *"Want to save these insights? Create a free account."* This replaces the current pre-emptive `LoginPromptBanner`.
**Alternative considered**: Modal dialog — rejected, too disruptive.

### D4 — Textarea auto-grow
**Decision**: Replace the fixed-height `<input>` or `<textarea>` in `InputBar.tsx` with a `<textarea>` that uses `onInput` to set `style.height = scrollHeight`. Min height 44px, max 160px.
**Alternative considered**: Third-party rich text editor — overkill for a chat input.

### D5 — Line spacing via CSS token
**Decision**: Add `leading-relaxed` (Tailwind, `line-height: 1.625`) to the message text container in `UserMessageBubble.tsx` and the AI response renderer. No layout changes needed.

### D6 — Latest result auto-surfacing
**Decision**: When a new `CanvasModule` is pushed to the canvas, scroll the canvas panel to the top (or to the new module) using a `useEffect` + `ref.scrollIntoView({ behavior: 'smooth' })`.

### D7 — Source attribution consistency
**Decision**: The backend already emits `sources` per stream. Ensure the frontend accumulates and renders sources per-suburb result, not just for the first. Audit `JourneyCanvas` / `CanvasModule` to ensure each module independently stores and displays its own sources array.

## Risks / Trade-offs

- **Auth deferral UX risk**: Users who get deep into results without signing up may lose context on page refresh → Mitigation: show a soft "unsaved session" indicator alongside the save CTA.
- **sessionStorage message replay**: If user dismisses auth mid-flow and returns later, message may be stale → Mitigation: clear sessionStorage after successful replay, set a short TTL (30 min).
- **Auto-grow textarea reflow**: On mobile, height changes can cause scroll jumps → Mitigation: keep `overflow-y: auto` and cap max-height.

## Migration Plan

1. All changes are additive — no DB migrations or API versioning needed
2. Deploy frontend changes independently of backend
3. Feature-flag auth deferral if needed for A/B testing (optional)
4. Rollback: revert component changes; no persistent state is affected

## Open Questions

- Should "buyer's agent" be replaced with "property advisor", "AI assistant", or something else? (copy decision needed)
- Should the save CTA be shown after the first AI message, or only after a suburb snapshot is returned?
