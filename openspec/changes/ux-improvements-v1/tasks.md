## 1. Landing page → chat redirect (Issue #1, #2)

- [x] 1.1 In `landing-theme.tsx`, on chat input submit: store the message in `sessionStorage` under key `brick_guest_initial_message` then redirect to `/chat` using `useRouter().push('/chat')`
- [x] 1.2 In `ChatRoutePage` (or `ChatLayout`), on mount: read `brick_guest_initial_message` from `sessionStorage`, pass it as `initialMessage` prop, then delete the key from `sessionStorage`
- [x] 1.3 Remove the login redirect guard in `ChatRoutePage` so unauthenticated users can access `/chat` freely

## 2. Guest turn limit (Issue #1, #3)

- [x] 2.1 Update `useInMemorySession` to persist `messageCount` (user-sent messages only) in `sessionStorage` under key `brick_guest_turn_count` so the count survives page refresh
- [x] 2.2 Update `AuthGate` to disable the input and show the login prompt when `messageCount >= 3` (currently threshold is `>= 1`)
- [x] 2.3 Update `LoginPromptBanner` copy to: *"You've used your 3 free questions. Sign in to keep going."*

## 3. Preserve chat history after login (Issue #2)

- [x] 3.1 In `ChatLayout`, when the user transitions from unauthenticated → authenticated (detect via `AuthProvider` state change), do NOT clear in-memory messages — keep them in the chat panel
- [x] 3.2 Ensure `useInMemorySession.clear()` is NOT called on login; only call it on explicit new session / logout
- [x] 3.3 Verify: after login the guest messages remain visible and the user can send a 4th message

## 4. Save results CTA (Issue #3)

- [x] 4.1 Create `SaveResultsBanner` component — inline non-blocking banner with copy: *"Want to save these insights? Create a free account."* and a sign-up CTA button
- [x] 4.2 In `ChatLayout` or `JourneyCanvas`, show `SaveResultsBanner` to unauthenticated users once a suburb snapshot module has been rendered (track with a `hasSuburbResult` flag in context)
- [x] 4.3 Clicking the CTA in `SaveResultsBanner` triggers signup flow (reuse existing auth flow) without navigating away or losing chat state

## 5. Cleanup & validation

- [ ] 5.1 Close GitHub issues #1, #2, #3 once all tasks above are verified in the browser
- [ ] 5.2 Take before/after screenshots and store in `screenshots/issue-1-2-3-auth-flow/`
