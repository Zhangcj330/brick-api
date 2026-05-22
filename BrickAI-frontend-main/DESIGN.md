# Design System — Brick AI

## Product Context
- **What this is:** A buyer-side property decision tool for Australian home buyers, centered on serious property evaluation rather than casual listing browsing.
- **Who it's for:** Sydney-first-home-buyer style users who are skeptical of marketing language, want plain-English guidance, and need help interpreting risk, reports, contracts, and suburb tradeoffs.
- **Space/industry:** Proptech, but specifically buyer-side decision support rather than portal search or agent marketing.
- **Project type:** Web app with dashboard, explore, a single-property workspace that contains the report workflow, contextual chat, and document explanation surfaces.

## Aesthetic Direction
- **Direction:** Editorial Civic
- **Decoration level:** Intentional
- **Mood:** Calm, grounded, evidence-aware, and buyer-loyal. It should feel like a composed decision desk with editorial intelligence, not a portal trying to excite you into clicking and not a consultancy site pretending authority through blandness.
- **Reference sites:** The category splits between portal seduction and consultancy blandness. Brick AI should borrow neither wholesale. It should feel closer to a trust-heavy workspace with contextual imagery and restrained editorial polish.

## Core Design Thesis
Brick AI already has a useful base visual language: light backgrounds, dark anchors, generous radius, and soft glass-like layering. Keep that. The upgrade is not "more modern." The upgrade is making the UI visibly buyer-side.

This means:
- `reason` outranks `spec`
- `context` outranks `staging`
- `decision framing` outranks `score`
- `chat` supports the workflow without becoming the product's hero

## Aesthetic Rules
- The product should feel quieter than a property portal and warmer than an enterprise dashboard.
- Surfaces should suggest paper, limestone, and map tables rather than polished SaaS chrome.
- Context imagery, parcel views, and map-like frames should become the signature media language for serious-mode screens.
- Listing imagery still matters, but it should not dominate trust-heavy flows.

## Typography
- **Display/Hero:** `Instrument Serif`
  - Use for page heroes, section headers, and decisive framing lines.
  - Rationale: gives Brick AI editorial authority and distinctiveness without becoming luxury cosplay.
- **Body:** `Geist`
  - Use for body copy, buttons, labels, nav, and UI controls.
  - Rationale: clean, modern, legible, and calm; pairs well with a serif accent.
- **UI/Labels:** `Geist`
  - Use medium weight sparingly; default to regular.
- **Data/Tables:** `Geist` with tabular numbers
  - Rationale: keeps app surfaces unified while still working for numeric/report rows.
- **Evidence / excerpts / code-like text:** `IBM Plex Mono`
  - Use for report snippets, source labels, version references, and contract excerpts.
  - Rationale: separates evidence-like content from narrative text without making the UI feel technical-first.
- **Loading:** Google Fonts or Bunny Fonts for `Instrument Serif`, `Geist`, and `IBM Plex Mono`.

### Type Scale
- `display-xl`: 56px / 1.05 / Instrument Serif
- `display-lg`: 44px / 1.08 / Instrument Serif
- `display-md`: 36px / 1.12 / Instrument Serif
- `heading-xl`: 30px / 1.2 / Instrument Serif
- `heading-lg`: 24px / 1.25 / Instrument Serif
- `heading-md`: 20px / 1.3 / Geist Medium
- `body-lg`: 18px / 1.6 / Geist
- `body-md`: 16px / 1.6 / Geist
- `body-sm`: 14px / 1.55 / Geist
- `label-sm`: 12px / 1.4 / Geist Medium with restrained tracking
- `mono-sm`: 13px / 1.5 / IBM Plex Mono

### Typography Rules
- Never use serif for dense UI labels, filters, chips, or form controls.
- Never use mono for paragraph content.
- The serif should appear as judgment, framing, and orientation, not as decoration sprayed everywhere.

## Color
- **Approach:** Restrained-balanced

### Core Palette
- **Paper:** `#FFFDF8`
  - Main app background
- **Limestone:** `#F6F1E7`
  - Secondary background, soft section fields
- **Chalk:** `#ECE5D7`
  - Borders, quiet fills, subtle chips
- **Ink:** `#171614`
  - Primary text and strongest anchors
- **Slate:** `#6E736B`
  - Secondary text and metadata
- **Eucalyptus:** `#355B4C`
  - Positive trust tone, active context, primary accent
- **Fog:** `#DCE4DE`
  - Positive-tinted background surfaces
- **Clay:** `#A66A43`
  - Caution tone, document complexity, "proceed carefully" states
- **Dust:** `#E9DDD1`
  - Warm highlight fills
- **Signal:** `#B6523B`
  - Destructive or materially concerning states only
- **Night:** `#0E1210`
  - Alternate deep surface for dark anchored controls

### Semantic Usage
- **Positive / trust-supporting:** `Eucalyptus`
- **Caution / frictions / checks outstanding:** `Clay`
- **Critical / destructive:** `Signal`
- **Neutral structure:** `Ink`, `Slate`, `Chalk`

### Dark Mode
- Dark mode is not the design center.
- If implemented, keep it deep olive-charcoal, not neon or purple.
- Reduce saturation by 10-20%; preserve calmness.

### Color Rules
- Avoid bright tech blues and purple gradients.
- Do not color-code verdicts like traffic lights.
- Use color to bias interpretation gently, not to simulate false certainty.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable, disciplined
- **Scale:** `4, 8, 12, 16, 24, 32, 48, 64, 80`

### Spacing Rules
- Dashboard and report pages should breathe, but not drift into luxury whitespace.
- Report modules and chat threads should be denser than hero areas.
- A major section should usually have at least 24-32px internal padding.

## Layout
- **Approach:** Hybrid
- **Grid:**
  - Mobile: 4 columns
  - Tablet: 8 columns
  - Desktop: 12 columns
- **Max content width:** 1360px for dashboard/report shells
- **Reading width:** 680-760px for dense text/report passages

### Border Radius
- `xs`: 8px
- `sm`: 12px
- `md`: 16px
- `lg`: 22px
- `xl`: 30px
- `pill`: 9999px

### Radius Rules
- Inputs, chips, and compact UI use `sm`/`md`
- Major cards use `lg`
- Hero media and flagship containers may use `xl`
- Do not make everything equally round

## Shadow & Surface System
- Primary card shadow: soft and wide, not dark and sharp
- Secondary card shadow: nearly invisible, mostly border-led
- Glass effects are acceptable in moderation for overlays and chips, not for every panel

### Surface Hierarchy
1. `Base`: Paper background
2. `Soft section`: Limestone / Chalk
3. `Card`: white or near-white with hairline border
4. `Anchored action`: Night or Ink with light text
5. `Contextual highlight`: Fog / Dust tint based on semantic role

## Motion
- **Approach:** Intentional
- **Easing:** soft ease-out for reveals, ease-in-out for layout transitions
- **Duration:**
  - micro: 80-120ms
  - short: 160-220ms
  - medium: 260-360ms
  - long: 420-560ms

### Motion Rules
- Chat panel expansion, prompt folding, and sheet transitions should feel deliberate and calm.
- Avoid bouncy motion.
- Avoid generic dashboard shimmer overload.
- Motion should clarify structure, not entertain.

## Signature Elements

### 1. Context Imagery
- Parcel, map, aerial, or contextual property views are the serious-mode signature visual.
- They should be framed with calm, editorial treatment.
- These visuals should communicate reality and environment, not marketing staging.
- Workspace hero and dashboard portfolio rows should prefer the same overview / top-down image, while Explore can keep listing imagery.

### 2. Decision Framing Block
- Every serious property/workspace surface should open with a framing block:
  - verdict
  - one-line why
  - biggest caution
- This is the product's heart.

### 3. Ask Brick AI Strip / Panel
- Chat appears as support infrastructure, not center-stage AI theatre.
- Desktop: visible but compact contextual panel or strip.
- Mobile: bottom sheet or dedicated task view.

## Component Guidance

### Dashboard
- Feels like a buyer portfolio board, not a single-property cockpit
- Order:
  1. address lookup / resume
  2. interested properties board
  3. Ask Brick AI
- Address lookup should be simpler than Explore: a direct search field, not an explanatory mini-hero
- Interested properties board should show, per row:
  - address + suburb
  - verdict
  - one-line why
  - lifecycle stage
  - report purchased / not purchased
  - next best move
  - last updated
  - `Open workspace` and `Chat about this property`
- Feed belongs to Explore, not Dashboard
- Recent memory should be absorbed into portfolio continuity, not rendered as a competing section
- Never use internal report version labels like `Report v1` or `Report v2` as a primary UI state

### Property Card
- Must be reason-first
- Order:
  1. media
  2. verdict
  3. one-line reason
  4. essential price/meta
  5. key insights
  6. action

### Workspace
- Workspace is the canonical single-property surface; the report lives inside it
- Hero should be context-first, not listing-photo-first
- Report content should use modular blocks with clear semantic grouping inside the workspace
- Property-bound chat should sit beside or beneath the report without eclipsing it
- Lifecycle stage should drive the workspace CTA and proceed section
- Organize the page by buyer decision value, not by backend schema shape
- All workspace data should fall into one of four layers:
  - decision
  - action
  - diagnostic
  - reference
- Preferred order:
  1. property identity rail
  2. summary decision hero
  3. stage timeline + next action
  4. what you need to do to proceed
  5. report / evidence
  6. property-bound chat
- The hero should answer, above the fold:
  - what this property is
  - what we think
  - why
  - highlights
  - concerns
- Lifecycle stage should be represented in a separate timeline / journey component, not inside the decision card
- The stage timeline should have a fixed visible width on desktop and allow horizontal scrolling when needed
- Users should be able to click any stage, including earlier stages, to revisit that part of the journey
- Tablet and desktop should expose explicit left/right controls for the stage rail
- The stage action card should focus on the action itself, not repeat the selected stage label as its headline
- Tablet and standard desktop widths should keep the stage and evidence sections full width, matching the hero; only very wide screens should push chat into a side column
- Hero actions should be secondary only:
  - `Save to watch`
  - `Chat`
- The stage timeline owns the primary proceed CTA
- `Highlights` and `Concerns` should live inside the `Overview` evidence tab, not as a competing top-level page section
- As data grows, do not create a new top-level section for each source object.
- Stable report modules should stay buyer-readable:
  - property facts
  - condition and quality
  - defects and maintenance
  - environment and livability
  - planning and constraints
  - location and amenity
  - market and pricing
  - sale process and timing
  - documents and interpretation
  - reference and provenance
- Evidence should live in a tabbed `Evidence Hub`, not one uninterrupted report stack
- Preferred tabs:
  - `Overview`
  - `Visual`
  - `Property`
  - `Location`
  - `Land & Planning`
  - `Financial`
  - `Documents`
- Lifecycle stage should choose the default evidence tab
- Visual priority inside the Evidence Hub:
  - aerial / top-down
  - map / orientation / boundary
  - floorplan
  - listing detail images
- Lifecycle stages:
  - `Shortlisted`
  - `Reviewing report`
  - `Ready for inspection`
  - `Needs further checks`
  - `Preparing offer`
  - `Under contract`
  - `Pre-settlement`
  - `Settled`
- Report purchase state should be separate:
  - `Report not purchased`
  - `Report purchased`

### Chat
- Context-scoped threads:
  - suburb
  - property
  - report
  - document
- Shared user memory underneath
- Prompt chips only in idle-at-bottom state with empty input
- Missing-context states should feel helpful, not like dead-end errors

### Document Explanation
- Always begin with summary before free-form questions
- Contracts and reports need explicit caveat styling
- Use mono and bordered excerpt blocks for extracted source passages

## Copy Style
- Avoid valuation theater:
  - no `undervalued`
  - no `bargain`
  - no `strong buy`
- Prefer grounded, evidence-linked language
- Standard verdicts:
  - `Worth pursuing`
  - `Proceed with caution`
  - `Too many unknowns right now`

## Responsive Guidance
- Mobile is task-led, not a stacked desktop
- Dashboard on mobile should foreground the property list and keep each row scannable as a compact stack
- Chat on mobile should use a bottom sheet by default
- Large media blocks should crop intentionally, not collapse awkwardly

## Accessibility
- Minimum touch target: 44px
- Strong visible focus states
- Comboboxes and drawers require proper keyboard navigation
- Context labels in chat must be readable and persistent
- Semantic color must never carry meaning alone

## What to Keep from the Current Brickaifigma Direction
- Light foundation
- Dark anchored CTAs
- Soft card elevation
- Large but controlled radii
- Editorial spacing

## What to Change
- Reduce generic app neutrals and replace with warmer, grounded tones
- Give typography a real personality instead of relying only on default sans styling
- Make context imagery a first-class design asset
- Redesign property cards to be buyer-side, not portal-generic
- Treat chat as a contextual workspace, not a floating assistant gimmick

## Anti-Patterns
- Purple AI gradients
- Oversized score circles as the main decision UI
- Portal-like image-first property tiles without reasoning
- Generic customer-support floating bubble for chat
- Symmetric widget dashboards with equal-weight cards everywhere

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-22 | Design system created from current Brickaifigma direction | Preserve the good visual base while upgrading it into a buyer-side decision system |
| 2026-03-22 | Use Editorial Civic as aesthetic direction | Distinguishes Brick AI from both listing portals and bland advisory sites |
| 2026-03-22 | Instrument Serif + Geist + IBM Plex Mono | Gives the product judgment, clarity, and evidence styling without AI slop |
| 2026-03-22 | Warm restrained palette anchored by Eucalyptus and Clay | Makes trust and caution legible without red/green verdict theater |
