# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HeatAlert Dashboard** — a real-time heat vulnerability monitoring tool for Montgomery, Alabama. Single-page dashboard with an interactive Leaflet map, live NWS weather data, Montgomery ArcGIS Open Data integration, and AI-powered risk analysis via Google Gemini.

Deployed at: https://heat-alert-dev.vercel.app/
GitHub: git@github.com:soneeee22000/HeatAlert.dev.git

## Commands

```bash
npm run dev          # Start dev server on port 9002 (regular webpack, NOT turbopack)
npm run build        # Production build (NODE_ENV=production next build)
npm run lint         # ESLint
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run genkit:dev   # Start Genkit dev UI for AI flow testing
```

**Important:** Do NOT use `--turbopack` flag — it causes curl/fetch requests to hang indefinitely on this project.

## Architecture

### Data Flow

```
NWS API (weather.gov) ──► /api/weather (proxy) ──┐
                                                   ├──► useDistrictData() hook ──► page.tsx
ArcGIS REST APIs ──► /api/montgomery-data (proxy) ─┘         │
                                                              ▼
                                          buildDistricts() merges GeoJSON + live data
                                                              │
                                                    ┌─────────┴──────────┐
                                                    ▼                    ▼
                                              DistrictMap        DistrictDetailPanel
                                             (Leaflet)          (AI analysis + PDF)
```

- **API route proxies** (`src/app/api/`) solve CORS and enable server-side caching
- **`useDistrictData()` hook** (`src/hooks/use-district-data.ts`) orchestrates all fetching with `Promise.all`, AbortSignal timeouts, and graceful fallback
- **`buildDistricts()`** (`src/lib/district-data.ts`) enriches static GeoJSON with live data and computes heat risk per district using a summer baseline projection (`SUMMER_BASELINE = 96°F`)

### Key Modules

- **`src/lib/constants.ts`** — Single source of truth for coordinates, API URLs, heat risk thresholds, colors, and map styles. All thresholds and colors live here.
- **`src/lib/montgomery-geojson.ts`** — GeoJSON FeatureCollection with polygon boundaries for 7 Montgomery neighborhoods. Each feature has demographic properties and a `heatOffset` for risk differentiation.
- **`src/lib/api/weather.ts`** — NWS API client (station KMGM). Returns `WeatherData` with C→F conversion and fallback.
- **`src/lib/api/arcgis.ts`** — ArcGIS REST client with multi-endpoint candidates and 5s `AbortController` timeout per request. Returns empty arrays on failure.
- **`src/app/actions.ts`** — Server actions for AI features. Accepts a `DistrictInput` interface (serializable subset of `District` — no GeoJSON features).

### AI Layer (Google Genkit + Gemini 2.5 Flash)

- **`src/ai/genkit.ts`** — Genkit instance configured with `googleai` plugin
- **`src/ai/flows/generate-district-summary-flow.ts`** — Per-district vulnerability analysis (score 0-100, findings, recommendations, budget)
- **`src/ai/flows/generate-grant-report-summary-flow.ts`** — Grant application narrative generator with EPA EJ template
- AI flows use Zod schemas for structured input/output

### Map (Leaflet)

- `DistrictMap` is dynamically imported with `ssr: false` — Leaflet requires `window`
- CartoDB dark tiles (free, no API key)
- GeoJSON polygons colored by heat risk level using hex colors from `constants.ts`

### UI Components

- shadcn/ui + Radix primitives in `src/components/ui/`
- Dashboard components in `src/components/dashboard/` (map, detail panel, overview bar, legend, summary card, grant generator, PDF report)
- `jsPDF` for client-side PDF generation (`src/components/dashboard/pdf-report.tsx`)

## Environment Variables

```
GOOGLE_GENAI_API_KEY=   # Required for Gemini AI features
```

No other API keys needed — NWS and CartoDB are free/unauthenticated.

## Gotchas

- **Serialization boundary:** Server actions cannot receive the full `District` type (contains GeoJSON `feature`). Extract only `DistrictInput` fields before calling `handleGenerateReport()` or `handleGenerateDistrictSummary()`.
- **Summer baseline:** `buildDistricts()` uses `Math.max(cityTemp, 96)` so demos show meaningful risk variation even at nighttime/winter temperatures.
- **ArcGIS flakiness:** Montgomery's ArcGIS endpoints are unreliable. All fetches use 5s timeouts and the app works fully with zero ArcGIS data.
- **`next.config.ts`** has `ignoreBuildErrors: true` for both TypeScript and ESLint — inherited from the original Firebase Studio scaffold.
- **Dark mode only:** The app forces `className="dark"` on `<html>` in `layout.tsx`.
