# TOURISM PLATFORM — Claude AI Development Guidelines (Skills)

> **CRITICAL**: Read and obey every section below before making ANY change to the codebase. Violating these rules will break the application.

---

## 1. PROJECT OVERVIEW

This is a **React + TypeScript + Vite** tourism platform with:
- Firebase (Firestore) backend for tours, accommodations, bookings, users.
- An interactive **3D Globe Explorer** (`PlanetExplorer.tsx`) rendered on HTML Canvas.
- GeoJSON-based country borders (`wolrd.json.txt`) and admin-1 subdivision borders (`admin1.geo.json`).
- Tailwind CSS + DaisyUI for general UI; **Vanilla CSS** (`index.css`) for all `planet-*` classes.
- Lazy-loaded PlanetExplorer at route `/navegar`.

---

## 2. FILE INVENTORY — DO NOT DELETE OR RENAME

These files are essential. **Never delete, rename, or move them**:

| File | Purpose |
|---|---|
| `src/pages/PlanetExplorer.tsx` | The 3D globe — ALL globe logic lives here (~2164 lines). |
| `src/pages/user/wolrd.json.txt` | Country border GeoJSON (loaded via Vite `?url` import). |
| `public/admin1.geo.json` | Admin-1 (departments/states) GeoJSON (~40 MB). |
| `src/components/planet/InfoPanel.tsx` | Wikipedia info panel shown on globe. |
| `src/components/planet/ItemPanel.tsx` | Tour/Accommodation detail panel on globe. |
| `src/services/overpass.ts` | Overpass API wrapper for dynamic city/place fetching. |
| `src/services/firebase.ts` | Firebase init + `COLLECTIONS` constant. |
| `src/hooks/useTours.ts` | Hook to fetch tours from Firestore. |
| `src/hooks/useAccommodations.ts` | Hook to fetch accommodations from Firestore. |
| `src/types/index.ts` | All TypeScript interfaces (Tour, Accommodation, Booking, etc.). |
| `src/index.css` | Global CSS including all `planet-*` component styles. |
| `src/App.tsx` | Root component with routing, AuthProvider, CityProvider. |
| `public/world.geo.json` | Backup country border data. |

---

## 3. ARCHITECTURE RULES — PlanetExplorer.tsx

### 3.1 Single-File Globe
The entire globe component lives in `PlanetExplorer.tsx`. Do NOT split it into multiple files unless the user explicitly requests it. The canvas rendering loop, geometry helpers, interaction handlers, and data declarations are all intentionally co-located.

### 3.2 `countryData` Object (Lines ~57–464)
This is the **master data source** for countries with detailed city + tourist place info. Structure:

```typescript
const countryData: Record<string, CountryData> = {
  'Colombia': {
    name: 'Colombia',
    iso_a2: 'CO',
    capitalLat: 4.7110,
    capitalLng: -74.0721,
    borders: [[lat,lng], ...],
    cities: [
      {
        name: 'Cartagena',
        lat: 10.3910,
        lng: -75.4794,
        admin1Name: 'Bolívar',  // MUST match name in admin1.geo.json
        touristPlaces: [...]
      },
      // ... more cities
    ]
  },
  // ... other countries
};
```

**Rules for `countryData`**:
- **NEVER remove existing countries** or cities unless the user explicitly asks.
- **NEVER change coordinates** of existing entries without verifying the new ones are correct.
- `admin1Name` must match a region name that exists in `admin1.geo.json` (after normalization). If it doesn't match, the city silhouette will not render.
- `iso_a2` is required for admin-1 border lookup. Without it, department borders won't show.
- The `borders` arrays on countries are **approximate visual outlines** used for the globe view only. Real borders come from the GeoJSON files.

### 3.3 `simpleCountries` Array (Lines ~467–502)
Countries shown as dots on the globe without detailed city data. Only touch this to add new countries.

### 3.4 Geometry Helpers — DO NOT MODIFY
These functions implement the 3D sphere projection and MUST NOT be changed:

| Function | Purpose |
|---|---|
| `geoToSpherical(lat, lng)` | Converts lat/lng to spherical θ/φ. |
| `sphereTo2D(...)` | Projects spherical coords to 2D canvas with rotation and tilt. |
| `lerp(a, b, t)` | Linear interpolation for animations. |
| `easeOutCubic(t)` | Easing function for smooth zoom. |
| `normalizeAdmin1Name(name)` | Strips diacritics, lowercases for GeoJSON name matching. |
| `computeDeclusterOffsets(...)` | Spreads overlapping markers apart. |

### 3.5 Camera & Zoom System
- `stateRef.current` holds ALL mutable animation state (rotation, zoom progress, selected country/city/place, camera stack).
- The **camera stack** (`cameraStack`) enables the back button. Each click pushes a snapshot; `goBack()` pops and animates to it.
- `zoomToLocation(lat, lng, name, level)` triggers zoom animation. The zoom factors are:
  - `country`: `initialRadius * 6`
  - `city`: `initialRadius * 80`
  - `place`: `initialRadius * 220`
- **DO NOT change these zoom factors** without explicit user request. They control how close the camera zooms.

### 3.6 GeoJSON Loading (Lines ~741–860)
Two GeoJSON files are loaded at mount:
1. **Country borders** from `wolrd.json.txt` → stored in `geoBordersRef`, `countryBordersByNameRef`.
2. **Admin-1 borders** from `/admin1.geo.json` → stored in `admin1BordersByNameRef`, `admin1BordersByKeyRef`, `admin1BordersByCountryRef`.

**Lookup priority for admin-1**:
1. ISO-scoped key: `${iso_a2}::${normalizedName}` (preferred)
2. Fallback: normalized name only

### 3.7 Dynamic Data Fetching (Lines ~862–916)
- When entering country level → `fetchCitiesForCountry()` via Overpass API adds cities dynamically.
- When entering city level → `fetchTouristPlaces()` adds tourist places for cities that don't have hardcoded ones.
- These mutate the selected country/city **in-place** so the draw loop picks them up.
- **DO NOT convert these to immutable state updates** — the canvas draw loop reads refs, not React state.

### 3.8 Canvas Draw Loop (Lines ~1438–2035)
The `draw()` function runs on `requestAnimationFrame`. Drawing order:
1. Stars background
2. Globe gradient sphere
3. Country borders (GeoJSON)
4. Selected country highlight silhouette
5. Admin-1 subdivision lines
6. Selected city admin-1 highlight (amber stroke)
7. Grid lines (globe level only)
8. Markers (country dots → city dots → tourist place dots → tour/accommodation markers)
9. Search markers

**Rules**:
- Always use `ctx!` (non-null assertion) — the context is guaranteed after the initial check.
- Marker visibility is gated by `st.zoomAnimationComplete` to avoid showing markers mid-zoom.
- The `hoveredCountry/City/Place` state is set in `onPointerMove`, consumed in `draw()`.

### 3.9 Interaction Levels
The globe has 4 levels: `globe` → `country` → `city` → `place`.
- At each level, only the NEXT level's markers are interactive.
- `interactionState` (React state) drives the UI panels.
- `stateRef.current.currentLevel` (ref) drives the canvas loop.
- Both must be updated together when changing levels.

---

## 4. CSS RULES — `index.css`

### 4.1 Planet Styles
All CSS classes starting with `planet-` belong to the globe UI. They live in `src/index.css` starting at line ~208.

**Naming convention**: BEM-like → `.planet-{component}__{element}--{modifier}`

**Key components**:
- `.planet-item-panel` — Tour/Accommodation detail (desktop: right side, mobile: bottom sheet)
- `.planet-info-panel` — Wikipedia info panel (same layout pattern)
- `.planet-search` — Search bar (desktop: center-left, mobile: full-width top)
- `.planet-breadcrumbs` — Back button + breadcrumb trail
- `.planet-streetview-modal` — Street View prompt modal

### 4.2 Mobile Breakpoints
- `≤768px`: Search moves to top, breadcrumbs below search.
- `≤640px`: Panels become bottom sheets.
- `≤380px`: Extra tight spacing for very small phones.

### 4.3 Adding New Styles
- Add new planet-related styles in the `index.css` planet section (after line ~208).
- Maintain the existing glassmorphism aesthetic (`backdrop-filter: blur(20px)`, dark semi-transparent backgrounds).
- **DO NOT remove existing styles** — other parts of the app depend on them.

---

## 5. DATA INTEGRITY RULES

### 5.1 TypeScript Types (`src/types/index.ts`)
- **NEVER remove or rename existing interface fields**. Other components depend on them.
- You can ADD new optional fields.
- The key types are: `Tour`, `Accommodation`, `Booking`, `User`, `Coords`, `Review`.
- Both `Tour` and `Accommodation` have `coords: Coords` and optional `city?: string`.

### 5.2 Firebase Collections (`src/services/firebase.ts`)
The `COLLECTIONS` constant defines collection names. **NEVER change existing collection names** — they map to live Firestore data.

### 5.3 Hooks (`src/hooks/`)
- `useTours()` and `useAccommodations()` fetch from Firestore and return arrays.
- They are used by `PlanetExplorer.tsx` to show tour/accommodation markers on the globe.
- The matching logic is in `itemMatchesCity()` — it does substring name matching + distance fallback.

---

## 6. ROUTING RULES (`src/App.tsx`)

- `/navegar` → `PlanetExplorer` (lazy-loaded, fullscreen, no header/footer)
- `/tours`, `/tours/:slug` → Tour listing and detail
- `/accommodations`, `/accommodations/:slug` → Accommodation listing and detail
- `/admin/*` → Admin dashboard (requires admin role)
- `/dashboard/*` → User dashboard
- **NEVER change existing route paths** without explicit user approval.

---

## 7. EXTERNAL API RULES

### 7.1 Overpass API (`src/services/overpass.ts`)
- Used for dynamic city/tourist place fetching.
- Has built-in caching via `Map`.
- Rate limited (~5 req/min). Don't increase query limits.
- `COUNTRY_ISO` maps country names to ISO codes. Add new entries as needed.

### 7.2 Nominatim Geocoding
- Used for search fallback in `PlanetExplorer.tsx`.
- Must include `User-Agent` header.
- Rate limited. Don't call in loops.

### 7.3 Wikipedia API (InfoPanel)
- Fetches summaries in Spanish first, English fallback.
- No API key required.

---

## 8. BUILD & DEV

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npx tsc --noEmit     # Type check
```

- Vite config: `vite.config.ts`
- The `wolrd.json.txt` import uses `?url` suffix for Vite asset URL handling.
- `admin1.geo.json` is in `public/` and fetched at runtime via `fetch('/admin1.geo.json')`.

---

## 9. COMMON PITFALLS — AVOID THESE

| ❌ Don't | ✅ Do Instead |
|---|---|
| Delete or rewrite the entire `PlanetExplorer.tsx` | Make targeted edits to specific sections |
| Change `geoToSpherical` or `sphereTo2D` | Leave geometry helpers untouched |
| Remove countries/cities from `countryData` | Only add new ones or fix coordinates |
| Convert canvas refs to React state | Keep mutable state in `stateRef.current` |
| Remove CSS classes from `index.css` | Add new classes or modify existing ones carefully |
| Change Firebase collection names | Add new collections if needed |
| Rename interface fields in `types/index.ts` | Add new optional fields |
| Move `wolrd.json.txt` to a different path | The import path in PlanetExplorer depends on its current location |
| Remove `admin1Name` from city data | It's required for department border rendering |
| Change zoom factor constants without testing | They affect the entire navigation experience |

---

## 10. TESTING

- Cypress is configured in `cypress/` directory.
- Config: `cypress.config.ts`
- Run: `npx cypress run` (headless) or `npx cypress open` (interactive)
- When making globe changes, manually verify by navigating to `/navegar` in the browser.

---

## 11. CHECKLIST BEFORE EVERY CHANGE

Before committing any change to globe-related code:

- [ ] `countryData` object is intact — no removed countries/cities
- [ ] All `admin1Name` values match entries in `admin1.geo.json`
- [ ] `iso_a2` is set on countries that need admin-1 borders
- [ ] Geometry helper functions are unchanged
- [ ] Camera stack push/pop logic is preserved
- [ ] Zoom factors haven't changed unintentionally
- [ ] CSS `planet-*` classes haven't been removed
- [ ] `types/index.ts` interfaces haven't lost fields
- [ ] Firebase collection names are unchanged
- [ ] The draw loop still follows the correct rendering order
- [ ] Mobile responsive breakpoints are intact
