# Copilot Instructions

## Repository Overview

This workspace is the **Brick** product design and planning environment. It contains:

- `openspec/` — Spec-driven change management workflow (powered by the `openspec` CLI)
- `design-system/` — Three design systems: **Brick AI**, **HIG** (Apple), and **Uber**
- `.github/skills/` — Copilot skills for the OpenSpec workflow
- `.github/prompts/` — Prompt shortcuts for the OpenSpec workflow

---

## OpenSpec Workflow

Changes follow a **spec-driven** lifecycle managed by the `openspec` CLI.

### Key CLI commands

```bash
openspec new change "<name>"                          # scaffold a new change
openspec list --json                                  # list all active changes
openspec status --change "<name>" --json              # check artifact status + schema
openspec instructions <artifact-id> --change "<name>" --json  # get instructions for an artifact
openspec instructions apply --change "<name>" --json  # get implementation instructions
```

### Change lifecycle

```
openspec new change → artifacts created in dependency order → implement tasks → archive
```

Active changes live at `openspec/changes/<name>/`. Archived changes move to `openspec/changes/archive/YYYY-MM-DD-<name>/`.

### Artifact pipeline (spec-driven schema)

Artifacts are created in dependency order. The `applyRequires` field in `openspec status --json` tells you which must be done before implementation can start. Typical order:

1. `proposal.md` — what & why
2. `design.md` — how
3. `specs/<capability>/spec.md` — capability requirements (delta specs, local to the change)
4. `tasks.md` — implementation steps as checkboxes

When implementing: mark tasks `- [ ]` → `- [x]` as you complete them.

### Artifact creation rules

- Use `openspec instructions <artifact-id> --change "<name>" --json` to get the template, instruction, outputPath, and contextFiles for each artifact.
- `context` and `rules` in the instructions JSON are **constraints for you** — never copy them into the artifact file.
- Always read dependency artifacts before writing a new one.

### Prompt shortcuts (in `.github/prompts/`)

| Shortcut | Purpose |
|---|---|
| `/opsx:propose` | Create a change and generate all artifacts in one step |
| `/opsx:apply` | Implement tasks from a change |
| `/opsx:explore` | Enter explore mode — thinking partner, no implementation |
| `/opsx:archive` | Archive a completed change |

These are backed by Skills in `.github/skills/`.

### Spec sync on archive

If a change has delta specs at `openspec/changes/<name>/specs/`, compare them with main specs at `openspec/specs/<capability>/spec.md` before archiving and offer to sync.

---

## Design Systems

All three design systems share the same structure:

- `colors_and_type.css` — single source of truth for all CSS custom property tokens
- `preview/*.html` — standalone browser-viewable component/token previews
- `ui_kits/` — interactive click-through UI kits (JSX components rendered via `index.html`)
- `SKILL.md` — agent skill manifest for loading the system into AI sessions
- `fonts/README.md` — font notes

### Brick AI Design System

The primary product design language for Brick.

- **Dark-first** — dark mode default; light mode via `[data-theme="light"]`
- **Brand accent**: Brick Red `#E8522A` — used sparingly (CTAs, links, AI identity)
- **Type**: Inter (`-0.025em` tracking) for UI, JetBrains Mono for code/tokens
- **Grid**: 4px base; tokens `--space-1` (4px) → `--space-64` (256px)
- **AI-native components**: chat interface, streaming text animation, model cards, brand glow shadows

```css
/* Usage pattern */
background: var(--brand);           /* Brick Red */
color: var(--fg-inverse);
border-radius: var(--radius-md);
padding: var(--space-3) var(--space-5);
transition: background var(--duration-fast) var(--ease-standard);
```

Logo assets in `assets/` are **placeholders** — replace with final brand files.

### HIG Design System

Apple Human Interface Guidelines reference kit for iOS/iPadOS/macOS apps.

- **Grid**: 8pt base; screen margins 16pt (iPhone), 20–24pt (iPad/Mac); touch targets 44×44pt minimum
- **Type**: SF Pro Text (≤19pt) / SF Pro Display (≥20pt); semantic text styles, not arbitrary sizes
- **Colors**: semantic dynamic colors (e.g., `systemBlue`) that auto-adapt light/dark/high-contrast
- **Materials**: use translucent materials (`ultraThin`…`ultraThick`) for floating surfaces over content
- **Radii**: ~6pt small chips, ~10pt fields/buttons/sheets, ~12pt cards
- **Shadows**: restrained; prefer materials over shadows; soft/short when needed
- **Copy voice**: sentence case, plain language, active voice, present tense; no periods on button labels

UI kits: `ui_kits/ios/` (habit tracker with tab bar), `ui_kits/macos/` (three-pane note app).

### Uber Design System

Uber's visual and verbal language for mocks, prototypes, and production.

- **Grid**: 4px base; 3-breakpoint layout (4-col/16px margin → 8-col/36px → 12-col/64px)
- **Color**: black `#000000` is the brand; white canvas; true-grey neutrals; no gradients
- **Accent green `#06C167`** belongs to Uber Eats — don't use for core Uber UI
- **Type**: Hanken Grotesk (substitute for proprietary Uber Move); weight contrast for hierarchy
- **Icons**: Lucide (CDN) substituting for Uber's proprietary icon set; 24px grid, 2px stroke, rounded caps
- **Copy voice**: sentence case, direct/action-first, no emoji in product UI, middot `·` as metadata separator

```html
<!-- Lucide icons -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="map-pin"></i>
<script>lucide.createIcons();</script>
```

Font and logo assets are substitutes — flag and swap for official files when available.

---

## Conventions

- Change names are **kebab-case** (e.g., `add-user-auth`)
- `openspec/config.yaml` holds the schema (`spec-driven`) and optional project context/rules — add tech stack, conventions, and domain knowledge here so they're included in artifact instructions
- The `openspec/specs/` directory holds canonical (main) specs; `openspec/changes/<name>/specs/` holds delta specs scoped to a change
- Design system `colors_and_type.css` files are the single source of truth — don't define tokens elsewhere
