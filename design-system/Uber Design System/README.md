# Uber Design System

A design system capturing the visual and verbal language of Uber — the global mobility and delivery platform — for use in mocks, prototypes, slides, and production code.

## Sources

No codebase, Figma link, or slide deck was attached to this project. The system below is reconstructed from Uber's **public** brand presence:

- Uber's consumer marketing site — uber.com
- The Uber Rider, Uber Driver, and Uber Eats mobile apps (iOS / Android stores)
- Uber's public design library, **Base Web** — baseweb.design / github.com/uber/baseweb
- Uber's public brand expression page — brand.uber.com (where reachable)

**If you have access to Uber's internal Figma libraries, the Base design tokens, or the Uber Move font files, please attach them — this system will get measurably more accurate.**

## What's in the box

- `colors_and_type.css` — CSS custom properties for the full Uber color palette and type scale
- `fonts/` — Web-font substitutes for Uber Move (see CONTENT note below)
- `assets/` — Logos, product marks, and brand imagery placeholders
- `preview/` — Specimen cards rendered in the Design System tab
- `ui_kits/`
  - `rider/` — Rider mobile app (request a ride, map view, trip summary)
  - `eats/` — Uber Eats food-ordering surface
  - `marketing/` — uber.com marketing site
- `SKILL.md` — Skill manifest so this can be lifted into Claude Code as `uber-design`

## Index

| File | What it covers |
|---|---|
| `README.md` | This file — context, content rules, visual rules, iconography |
| `colors_and_type.css` | Tokens — color vars, type vars, semantic selectors |
| `SKILL.md` | Agent Skill front-matter — load this to consume the system in Claude Code |
| `fonts/README.md` | Font substitution notes (drop real Uber Move files here) |
| `assets/*.svg` | Wordmark, sub-brand wordmark, app icons |
| `preview/*.html` | Spec cards shown in Design System tab |
| `ui_kits/rider/index.html` | Rider iOS click-through (Home → Search → Options → Tracking → Receipt) |
| `ui_kits/eats/index.html` | Uber Eats iOS click-through (Home → Restaurant → Tracking) |
| `ui_kits/marketing/index.html` | uber.com marketing homepage recreation |

---

## Content Fundamentals

Uber's voice is **plainspoken, confident, and quietly utilitarian.** It speaks like an operator, not a marketer — clarity beats cleverness. Copy is short, lowercase- and sentence-case-friendly, and almost entirely emoji-free.

**Tone**
- **Direct.** "Get a ride in minutes." not "Discover your perfect ride."
- **Action-first.** Headlines lead with verbs: *Request*, *Go*, *Earn*, *Order*, *Track*.
- **Pragmatic.** Specifics over adjectives — "$12.40 · 8 min" instead of "Affordable and fast."
- **Inclusive but neutral.** "Drive on your schedule" — never "Be your own boss," never "Hustle."

**Person**
- "You" addresses the rider/eater/driver. "We" is sparing — used for promises ("We're here 24/7") rather than chest-thumping.
- Imperative voice for CTAs: *Request now*, *See prices*, *Start earning*.

**Casing**
- **Sentence case everywhere** in product UI — buttons, headers, nav. Not Title Case.
- Marketing pages use sentence case headlines too. The only Title Case you'll see is in legal copy and proper nouns ("Uber Eats", "Uber for Business").
- Wordmark is always **Uber** — capital U, lowercase rest, in the custom Uber Move typeface.

**Punctuation & numbers**
- Middots (·) separate metadata: "4.9 · 1.2 mi · 5 min".
- Time is "5 min," not "5 minutes," in dense UI. Currency always shows the symbol.
- No exclamation points in product UI. Marketing uses them rarely.

**Emoji & informal punctuation**
- **No emoji** in product UI. None.
- No ALL CAPS for emphasis. No "🚀" launch announcements.
- Marketing may use a single tasteful illustration or photograph instead.

**Vibe**
- "Tap a button, get a car." A receipt for promises kept.
- Drivers/couriers are addressed as professionals, not gig-workers.
- Safety language is calm and concrete: "Share your trip" not "Stay safe!"

**Examples (paraphrased patterns, not exact production copy)**
- Headline: *Tap. Ride. Go.*
- Subhead: *Request a ride from your phone, anywhere in 10,000+ cities.*
- Button: *Request UberX* · *Schedule a ride* · *See prices*
- Empty state: *No recent trips.*
- Error: *Couldn't find a driver nearby. Try again in a moment.*
- Driver-side: *Go online to start earning.*

---

## Visual Foundations

Uber's visual identity is **mono-first, geometrically severe, and grid-driven.** Black on white. Type does the heavy lifting. Imagery is photographic, often product-in-context (a phone in a hand, a car at a curb). Illustration is sparing and always geometric.

**Color**
- **Black (#000000) is the brand.** It's the wordmark, the primary CTA, the body text, the icon stroke.
- **White (#FFFFFF)** is the canvas. Off-white (#F6F6F6 / "mist") is the secondary surface.
- Neutrals are a **true-grey** ramp — no warm tint, no cool tint. From near-black `#141414` to near-white `#EEEEEE`.
- **Accent green (#06C167)** belongs to Uber Eats. Don't borrow it for core Uber UI.
- Status colors are restrained: a single red (#E11900), a single green (#06C167), a single amber (#FFC043), a single blue (#276EF1). Used at full saturation only on small surfaces (badges, alerts).
- Gradients are **avoided**. If they appear, they're black-to-transparent for image protection — never decorative color blends.

**Typography**
- **Uber Move** (display) and **Uber Move Text** (body) are the production typefaces. Both are proprietary. We substitute **Hanken Grotesk** — a Google Font with similar humanist-geometric proportions, neutral cap-heights, and excellent legibility. Please flag and supply the real files if you have them.
- Hierarchy is established by **weight contrast** (Regular vs Bold) and **size jumps** — not color or italic.
- Bold is the default for headlines. Body uses Regular or Medium. Light is reserved for very large display sizes.
- Tracking is tight at large sizes (`-0.02em` at 48px+), neutral at body.
- Numbers are tabular in UI — fares, ETAs, ratings — to stop jitter when they update.

**Spacing**
- Base unit is **4px**. Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.
- Touch targets are 48px minimum (mobile-first product).
- Cards have 16–24px interior padding; screens have 16–20px gutters on mobile.

**Dimensions — Base sizing scale**
Base components don't use the 4px scale directly; they use a named "scale" ramp documented in `src/themes/shared/sizing.ts`. The numeric suffix is logical, not pixels.

| Token | px | Token | px | Token | px |
|---|---|---|---|---|---|
| `scale0`   | 2  | `scale600` | 16 | `scale1200` | 48 |
| `scale100` | 4  | `scale650` | 18 | `scale1400` | 56 |
| `scale200` | 6  | `scale700` | 20 | `scale1600` | 64 |
| `scale300` | 8  | `scale750` | 22 | `scale2400` | 96 |
| `scale400` | 10 | `scale800` | 24 | `scale3200` | 128 |
| `scale500` | 12 | `scale900` | 32 | `scale4800` | 192 |
| `scale550` | 14 | `scale1000`| 40 |             |    |

Used for component height, padding, gap, and icon sizing. `scale600` (16px) is the workhorse for buttons and form controls; `scale800` (24px) is the standard card padding; `scale1200` (48px) is the canonical touch target.

**Layout grid — three breakpoints, three grids**
Base uses three breakpoint-tiered grids. Each is a fixed-column layout with a defined margin and gutter; columns are fluid between margins.

| Breakpoint | Min width | Columns | Margin | Gutter |
|---|---|---|---|---|
| **Small** (mobile)  | 320  | 4  | 16 | 16 |
| **Medium** (tablet) | 600  | 8  | 36 | 24 |
| **Large** (desktop) | 1136 | 12 | 64 | 24 |

Max content width inside the Large grid is typically **1440px** (some marketing surfaces use 1280). Always lay copy and components on this grid; don't free-place full-bleed elements except in marketing heroes and image strips.

**Backgrounds**
- White is default. Off-white (`--mist`) is the secondary card/page surface.
- **Photos are full-bleed when used** — clean studio shots, real drivers/riders, lots of negative space. Cool-to-neutral grading; no Instagram filters; minimal grain.
- **No repeating patterns, no textures, no decorative gradients.**
- Maps (in product) use Uber's house map style — desaturated grey base, single accent green for the route line.

**Borders, radii, shadows**
- Corner radii: **0px** for outlined buttons and inputs in older surfaces; modern Base components use **4px (small), 8px (cards), 12px (sheets), 24px (pill buttons)**, with **999px** for circular avatar/chip.
- Borders: 1px solid `#E2E2E2` for input/divider; 2px solid black on focus.
- Shadows are subtle and functional — used to lift sheets and menus, never for decoration.
  - `--shadow-1`: `0 1px 2px rgba(0,0,0,0.06)` — resting card
  - `--shadow-2`: `0 4px 12px rgba(0,0,0,0.08)` — hover / floating button
  - `--shadow-3`: `0 12px 32px rgba(0,0,0,0.12)` — bottom sheet
- No inner shadows. No neumorphism.

**Animation & states**
- Easing: **`cubic-bezier(0.4, 0.0, 0.2, 1)`** (Material-style standard ease) at **160–240ms** for UI transitions; **400ms** for sheet sheets and full-screen transitions.
- Bottom sheets slide up with a slight overshoot, ~10ms damping tail.
- Hover (web/desktop): **darken** by ~8% for filled buttons (black → `#262626`), **lighten** background by 4% for outline buttons.
- Press: shrink **2–3%** (scale 0.97), no color flash on mobile. On web, press deepens the fill another 4%.
- Page transitions are **none or extremely subtle fade** — never slide carousels of marketing content.

**Transparency & blur**
- Used **only** on map overlays — the route summary card floats over the map with a `backdrop-filter: blur(20px)` and a 92% white tint.
- Status bar gradient ("protection gradient") sits behind status text on map screens: linear-gradient white → transparent over ~80px.
- Otherwise, surfaces are opaque. No frosted-glass aesthetic in marketing.

**Cards**
- White surface, `8px` radius, `1px solid #E2E2E2` OR `--shadow-1` — pick one, not both.
- Internal padding 16–24px.
- Typography hierarchy inside a card: 16/20 bold title, 14/18 grey body, 12/16 caption.

**Layout rules**
- Marketing site is a **12-column grid**, max content width ~1200–1400px, gutters 24–32px.
- Mobile app uses a **single column** with 16px page padding and 12px between cards.
- Fixed elements: top nav (white, 64px tall, 1px bottom border on scroll); mobile bottom sheet (drag handle, dynamic height).

**Iconography preview**
- Custom Uber icon set, 24px grid, 2px stroke, **rounded line caps**, mostly outline (filled variants exist for selected nav states).
- Substituted with **Lucide** (CDN) in this kit — same stroke weight, same rounded caps, same 24px grid. See ICONOGRAPHY below.

---

## Iconography

Uber maintains a **proprietary icon library** delivered as inline SVG via Base Web's `<Icon />` component (and as a private icon font in some surfaces). Icons are:

- **24×24 default grid** (also 16, 20, 32 variants)
- **2px stroke weight**
- **Rounded line caps and joins** (`stroke-linecap: round`, `stroke-linejoin: round`)
- **Outline by default**, filled for active/selected state — particularly in bottom nav
- Currentcolor inheritance — icons take the text color of their parent
- Geometric and pared-down — no decorative flourishes, no two-tone, no isometric

**Our substitute**
We use **[Lucide](https://lucide.dev/)** via CDN — `https://unpkg.com/lucide@latest`. It is a near-perfect match: same 24px grid, same 2px stroke, same rounded caps, same outline-first style. Filled variants are achieved with `fill="currentColor"` overrides.

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="map-pin"></i>
<script>lucide.createIcons();</script>
```

**Emoji**: never used in product UI. Marketing very rarely uses them.

**Unicode chars as icons**: avoided. The middot (`·`) is used as a metadata separator and is the only Unicode character that appears decoratively.

**Logos & marks** live in `assets/`:
- `assets/uber-wordmark.svg` — primary "Uber" wordmark (recreated using Hanken Grotesk Black; flag to user that proper Uber Move file is needed)
- `assets/uber-eats-wordmark.svg` — Eats sub-brand wordmark
- `assets/uber-app-icon.svg` — square rounded app-icon mark
- `assets/uber-eats-app-icon.svg` — Eats app-icon mark
- `assets/photo-*.jpg` — generic photographic placeholders (city, car, food)

---

## Caveats

- **Font substitution**: Hanken Grotesk in place of Uber Move/Uber Move Text. Letterforms differ — the real Uber Move has more distinctive geometric quirks. Swap in the licensed files and the design will tighten up considerably.
- **Logos**: the wordmark and app icons are reconstructed visually, not lifted from a brand kit. Use the official files for any external-facing work.
- **No internal Figma access**: tokens (radii, exact accent hex values, motion curves) are best-effort from public surfaces. The Base Web GitHub repo (uber/baseweb) is the most authoritative public reference.
