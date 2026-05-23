## Context

The `src/components/ui/` directory was scaffolded with a full shadcn/ui component set. The app only uses a small subset. The rest are inert files that clutter the directory.

`utils.ts` **must be kept** — it's imported by `button`, `badge`, `card`, `label`, `input`, and other retained components.
`use-mobile.ts` is **safe to delete** — only imported by `sidebar.tsx` which is itself unused.

## Goals / Non-Goals

**Goals:**
- Delete all shadcn/ui files with zero active imports from app code
- Leave the build and runtime behavior completely unchanged

**Non-Goals:**
- Refactoring component internals
- Replacing shadcn components with custom ones
- Touching any file outside `src/components/ui/`

## Decisions

**Delete by import count, not by assumption**
Run `grep -rl "from.*ui/<name>"` across `src/` (excluding the file itself) — only delete files with 0 results. This was already done; the list is confirmed.

**Keep `utils.ts`**
Despite having 0 direct app-level imports, `utils.ts` exports the `cn()` helper used internally by all retained ui components. Deleting it would break the build.

## Risks / Trade-offs

- [Risk] A file appears unused but is imported via a barrel or alias → Mitigation: double-check each file with grep before deleting
- [Risk] Future shadcn `npx shadcn add` may re-add deleted files → Acceptable: they'll be re-added only when needed
