# Brick AI Design System — Current Frontend

Design tokens and component previews extracted from **BrickAI-frontend-main**.

## Stack
- **Tailwind CSS v4** + **shadcn/ui**
- **Geist** (Google Fonts) — body and headings
- CSS custom properties via `colors_and_type.css`

## Structure

```
BrickAI-Current/
├── colors_and_type.css   ← single source of truth for all tokens
├── assets/               ← brand assets
├── fonts/                ← local font files (if any)
└── preview/              ← 16 self-contained HTML previews
    ├── brand-logo.html
    ├── brand-voice.html
    ├── brand-motion.html
    ├── color-palette.html
    ├── color-semantic.html
    ├── component-buttons.html
    ├── component-cards.html
    ├── component-chat.html
    ├── component-chips.html
    ├── component-inputs.html
    ├── spacing-elevation.html
    ├── spacing-radii.html
    ├── spacing-scale.html
    ├── type-body.html
    ├── type-display.html
    └── type-scale.html
```

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| White | `#ffffff` | Background |
| Black | `#030213` | Primary text, buttons |
| Gray 200 | `#e5e7eb` | Borders |
| Gray 500 | `#6b7280` | Secondary text |
| Positive | `#047857` | Worth pursuing |
| Caution | `#92400e` | Proceed with caution |
| Unclear | `#be123c` | Too many unknowns |

## Landing Variants
- **Aurora** — blue-50 → emerald-50 gradient
- **Dusk** — orange-50 → amber-50 gradient
- **Coastal** — cyan-50 → blue-50 gradient
