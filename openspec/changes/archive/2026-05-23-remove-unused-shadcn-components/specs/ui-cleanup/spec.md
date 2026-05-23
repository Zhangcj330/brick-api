# Spec: ui-cleanup

## Requirements

### Retained components (must not be deleted)
The following files in `src/components/ui/` shall be kept:
- `badge.tsx` — used in 7+ places
- `button.tsx` — used in 9+ places
- `card.tsx`, `chart.tsx`, `drawer.tsx`, `dropdown-menu.tsx`
- `input.tsx`, `label.tsx`, `scroll-area.tsx`, `select.tsx`
- `separator.tsx`, `slider.tsx`, `switch.tsx`
- `utils.ts` — internal dependency of all ui components above

### Files to delete (zero app imports)
All other files in `src/components/ui/` shall be deleted:
`accordion.tsx`, `alert.tsx`, `alert-dialog.tsx`, `aspect-ratio.tsx`, `avatar.tsx`,
`breadcrumb.tsx`, `calendar.tsx`, `carousel.tsx`, `checkbox.tsx`, `collapsible.tsx`,
`command.tsx`, `context-menu.tsx`, `dialog.tsx`, `form.tsx`, `hover-card.tsx`,
`input-otp.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`,
`progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `sheet.tsx`, `sidebar.tsx`,
`skeleton.tsx`, `sonner.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `toggle.tsx`,
`toggle-group.tsx`, `tooltip.tsx`, `use-mobile.ts`

### Verification
After deletion, `npm run build` (or `vite build`) must complete without errors.
