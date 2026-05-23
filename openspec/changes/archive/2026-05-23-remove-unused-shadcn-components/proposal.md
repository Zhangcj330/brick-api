## Why

`BrickAI-frontend-main/src/components/ui/` contains 46 shadcn/ui component files, but only 11 are actually imported anywhere in the app. The remaining 35 are dead code — adding noise, slowing down searches, and making the codebase harder to understand for new contributors.

## What Changes

- **Delete** 35 unused shadcn/ui component files from `src/components/ui/`
- **Keep** the 11 components that are actively imported
- No functional changes to the app — purely a file removal

### Files to delete (0 imports found):
`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `breadcrumb`, `calendar`, `carousel`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `form`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `sheet`, `sidebar`, `skeleton`, `sonner`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`, `use-mobile.ts`, `utils.ts`

### Files to keep (actively used):
`badge`, `button`, `card`, `chart`, `drawer`, `dropdown-menu`, `input`, `label`, `scroll-area`, `select`, `separator`, `slider`, `switch`

## Capabilities

### New Capabilities
- `ui-cleanup`: Remove all unused shadcn/ui component files, leaving only components with active imports.

### Modified Capabilities
<!-- none — no behavioral changes -->

## Impact

- Removes ~35 files from `src/components/ui/`
- No runtime impact — unused files are tree-shaken by Vite anyway
- Build output unchanged
- `utils.ts` and `use-mobile.ts` need a final check — they may be imported by other ui components internally before deletion
