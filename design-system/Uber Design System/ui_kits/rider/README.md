# Rider UI Kit

Five-screen click-through that recreates the core Uber Rider mobile flow:

1. **Home** — map with bottom sheet, "Where to?" search, saved places
2. **Search** — destination picker with pickup/destination inputs and a results list
3. **Ride options** — tiered vehicle list (UberX / Comfort / XL / Black) with fares and ETAs
4. **Tracking** — driver arrival ETA, vehicle and driver card, share-trip & cancel
5. **Receipt** — fare breakdown, rate-your-driver

## Components

| File | Component | Purpose |
|---|---|---|
| `ios-frame.jsx` | `IOSDevice` | iPhone device shell from starter components |
| `Icon.jsx` | `Icon` | Lucide-style 24/2/rounded SVG icon set |
| `MapBackground.jsx` | `MapBackground` | Stylized greyscale map with route, pins, car marker |
| `Screens.jsx` | `HomeScreen`, `SearchScreen`, `RideOptions`, `TrackingScreen`, `ReceiptScreen` | The five flow screens |
| `index.html` | `RiderDemo` | Click-through orchestrator |

## Caveats

- The map is hand-drawn SVG — not a real map. In production this would be Mapbox/Uber's house map style.
- Vehicle illustrations are simple SVG silhouettes; Uber uses licensed 3D vehicle renders.
- All icons use the Lucide substitute set documented in the root README.
