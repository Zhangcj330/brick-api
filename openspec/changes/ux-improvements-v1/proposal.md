## Why

Early user testing (Karin) revealed 9 friction points across auth flow, chat UI, and results display that reduce trust and conversion. These are quick wins with high impact on first-run experience.

## What Changes

- Delay account creation prompt until after users see their first property results
- Preserve the user's initial chat message through the signup/login flow
- Add a "save results" CTA that triggers signup at the right moment (post-value)
- Align logged-in `/chat` UI with homepage UI (Buy/Invest tabs)
- Replace "buyer's agent" wording throughout the app copy
- Expand chat input textarea to support multi-line input and auto-grow
- Increase line spacing in chat messages for readability
- Auto-scroll / surface the latest suburb snapshot when a follow-up query returns new results
- Fix source attribution so all suburb results (not just the first) show their data sources

## Capabilities

### New Capabilities

- `auth-flow`: Deferred account prompt — show results first, prompt signup on save action. Preserve initial message across auth interruption.
- `chat-input`: Multi-line auto-grow textarea for chat input field.
- `chat-readability`: Increased line height and spacing in chat message bubbles.
- `results-display`: Auto-surface latest suburb snapshot on follow-up queries; consistent source attribution across all results.
- `app-copy`: Replace "buyer's agent" terminology across all UI copy.
- `logged-in-ui`: Align logged-in chat page with homepage UI (Buy/Invest options).

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **Frontend**: `BrickAI-frontend-main` — auth components, chat page, homepage, textarea component, message bubble styles, result panel scroll logic
- **Backend**: `brick-api` — no API changes required for most issues; source attribution fix may require changes to SSE response structure
- **No breaking changes**
