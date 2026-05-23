## 1. Verify imports

- [x] 1.1 Confirm each file in the delete list has 0 imports by running grep across src/ (excluding the file itself)
- [x] 1.2 Confirm `utils.ts` is imported by retained components and must be kept

## 2. Delete unused files

- [x] 2.1 Delete `accordion.tsx`, `alert.tsx`, `alert-dialog.tsx`, `aspect-ratio.tsx`, `avatar.tsx`
- [x] 2.2 Delete `breadcrumb.tsx`, `calendar.tsx`, `carousel.tsx`, `checkbox.tsx`, `collapsible.tsx`
- [x] 2.3 Delete `command.tsx`, `context-menu.tsx`, `dialog.tsx`, `form.tsx`, `hover-card.tsx`
- [x] 2.4 Delete `input-otp.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`
- [x] 2.5 Delete `progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `sheet.tsx`, `sidebar.tsx`
- [x] 2.6 Delete `skeleton.tsx`, `sonner.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`
- [x] 2.7 Delete `toggle.tsx`, `toggle-group.tsx`, `tooltip.tsx`, `use-mobile.ts`

## 3. Verify build

- [x] 3.1 No imports of deleted files found via grep — node_modules not installed so full build skipped; import graph verified clean
- [x] 3.2 Confirm retained component files are all still present
