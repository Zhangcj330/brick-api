# Brick AI Design System — Fonts

## Production

Replace Google Fonts imports in `colors_and_type.css` with locally hosted files for:

1. **Inter** (display + body)  
   License: [SIL Open Font License 1.1](https://rsms.me/inter/)  
   Download: https://github.com/rsms/inter/releases

2. **JetBrains Mono** (code / mono)  
   License: [SIL Open Font License 1.1](https://www.jetbrains.com/lp/mono/)  
   Download: https://github.com/JetBrains/JetBrainsMono/releases

## Custom Font (future)

When a custom "Brick" typeface is commissioned, update the following variables in `colors_and_type.css`:

```css
--font-display: "BrickSans", "Inter", system-ui, sans-serif;
--font-body:    "BrickSans Text", "Inter", system-ui, sans-serif;
```

Place font files here as:
```
fonts/
├── BrickSans-Regular.woff2
├── BrickSans-Medium.woff2
├── BrickSans-SemiBold.woff2
├── BrickSans-Bold.woff2
└── BrickSans-ExtraBold.woff2
```
