# Uber Eats UI Kit

Three-screen Eats click-through:

1. **Home** — address header, category chips, filter row, "Featured on Uber Eats" feed
2. **Restaurant detail** — hero image, menu, add-to-cart with a black pill cart bar
3. **Order tracking** — map with route, step progress, courier card

## Components

| File | Purpose |
|---|---|
| `Icon.jsx` | Lucide-style icon set (shared with Rider) |
| `FoodArt.jsx` | Soft-gradient placeholder for food photography |
| `Screens.jsx` | `EatsHome`, `RestaurantDetail`, `CartBar`, `OrderTracking`, `EatsTabBar` |
| `index.html` | Click-through orchestrator |

## Caveats

- Eats relies heavily on photography (hero shots, dish thumbnails). Here we use placeholder gradients (`FoodArt`). Replace with real `<img>` for production fidelity.
- Real Eats has a tab bar with five entries on most regions; we render four to keep the kit lean.
