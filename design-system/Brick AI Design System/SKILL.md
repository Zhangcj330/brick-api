# Brick AI Design System — Skill

## What this skill provides

A complete design token system and component preview library for **Brick AI** — a dark-first AI product design language combining Uber's typographic precision with OpenAI's intelligent minimalism.

## Capabilities

- **`colors_and_type.css`** — Single CSS file with all design tokens (colours, type, spacing, radii, shadows, motion, z-index, breakpoints)
- **Dark + light mode** — Dark by default; light mode via `[data-theme="light"]`
- **14 preview HTML files** — Each renders standalone in a browser, covering brand, colour, type, spacing, and components
- **AI-native components** — Chat interface, streaming text animation, model cards, brand glow shadows

## How to use

1. Link `colors_and_type.css` in your HTML or import into your CSS/build system
2. Use CSS custom properties: `var(--brand)`, `var(--space-4)`, `var(--radius-md)`, etc.
3. Open any `preview/*.html` file directly in a browser to inspect the design

## Logo Assets

Production-ready SVG marks in `assets/`:

| File | Use |
|---|---|
| `brick-mark.svg` | Teal `#1fe7e0` — light surfaces, ≥48px |
| `brick-mark-dark.svg` | White — dark surfaces, ≥48px |
| `brick-mark-black.svg` | Black — print/neutral, ≥48px |
| `brick-mark-sm.svg` | Compact path — any colour, ≤32px |
| `brick-wordmark.svg` | Mark + "Brick AI" text, light backgrounds |
| `brick-wordmark-dark.svg` | Mark + "Brick AI" text, dark backgrounds |

Geometry: 128px module grid, both entry diagonals exactly 45°.
