---
name: uber-design
description: Use this skill to generate well-branded interfaces and assets for Uber, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens**: `colors_and_type.css` — color, type, spacing, radius, shadow, motion vars
- **Voice**: see CONTENT FUNDAMENTALS in README — direct, action-first, sentence case, no emoji
- **Visual rules**: see VISUAL FOUNDATIONS in README — black/white default, true-grey neutrals, restrained semantics, single-family type
- **Icons**: Lucide via CDN (substitute for Uber's proprietary set) — 24px / 2px / rounded
- **Fonts**: Hanken Grotesk (substitute for Uber Move/Uber Move Text)
- **UI kits**: `ui_kits/rider`, `ui_kits/eats`, `ui_kits/marketing` — copy the JSX components as a starting point

## When in doubt

- Black CTA, white surface, grey-50 secondary surface.
- 8px radius for cards and buttons. Pill (999px) for chips.
- 4px spacing base; 48px touch target.
- Sentence case.
- No emoji. No gradients beyond protection gradients. No decorative shadows.
- Numbers are tabular (`font-feature-settings: "tnum"`).
