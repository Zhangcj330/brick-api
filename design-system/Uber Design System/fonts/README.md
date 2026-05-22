# Fonts

**Substitute in use: [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk)** (loaded via Google Fonts in `colors_and_type.css`).

Uber's production typeface is **Uber Move** (display) and **Uber Move Text** (body). Both are proprietary and not redistributable.

If you have the licensed `.woff2` files, drop them in this folder and replace the `@import` in `colors_and_type.css` with a local `@font-face` block:

```css
@font-face {
  font-family: "Uber Move";
  src: url("./fonts/UberMove-Bold.woff2") format("woff2");
  font-weight: 700;
  font-display: swap;
}
```

Hanken Grotesk was chosen as a substitute because it shares Uber Move's:
- Humanist-geometric proportions
- Neutral cap-heights and large x-height
- Excellent legibility at small sizes
- Available bold weights (700, 800, 900) for display use
