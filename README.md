# BillboardIQ

Data-backed outdoor advertising intelligence for Tanzania. Drop a pin, get impressions, pricing, and a full location analysis in seconds.

**Live:** [bilboardiq.netlify.app](https://bilboardiq.netlify.app)

---

## What it does

BillboardIQ helps billboard owners, advertisers, and media buyers in Tanzania make pricing and placement decisions with real data instead of guesswork.

Given a map pin, it computes:

- **Traffic score** — congestion level, road type, and average vehicle speed
- **Foot traffic score** — nearby place density and category weight (banks, transport, retail, etc.)
- **Composite score** — combined 0–1 value with PREMIUM / HIGH / MEDIUM / LOW grade
- **Daily / weekly / monthly impression estimates**
- **Suggested monthly price in TZS** with a ±range
- **Exposure time** — seconds a driver has the billboard in view
- **Nearby places** — real OSM points of interest within 500m

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 — dark `kalax` theme |
| Auth | NextAuth v5 (Google OAuth + `@auth/pg-adapter`) |
| Database | Neon PostgreSQL (serverless) |
| Map | Leaflet + react-leaflet, CartoDB Voyager tiles |
| Traffic data | Google Routes API (falls back to road-type defaults) |
| Nearby places | OpenStreetMap Overpass API (free, no key) |
| Geocoding | Nominatim (reverse geocode + search) |
| Charts | Recharts |
| Deployment | Netlify + `@netlify/plugin-nextjs` |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Google sign-in
│   ├── manual/page.tsx             # Product guide / sales pitch (public)
│   ├── dashboard/
│   │   ├── page.tsx                # Overview — stats + recent analyses
│   │   ├── analyze/page.tsx        # Map + form to run a new analysis
│   │   ├── results/page.tsx        # Full analysis results page
│   │   ├── analytics/page.tsx      # Aggregate charts
│   │   ├── traffic/page.tsx        # Live traffic snapshots
│   │   ├── reports/page.tsx        # Saved reports list
│   │   └── settings/page.tsx       # Account settings
│   ├── report/[id]/page.tsx        # Standalone print/PDF report
│   └── api/
│       ├── analyses/route.ts       # GET list, POST create
│       └── analyses/[id]/route.ts  # GET single analysis
│
├── components/ui/
│   ├── map-display.tsx             # Leaflet map with draggable pin
│   ├── score-ring.tsx              # Circular score indicator
│   ├── peak-hours-chart.tsx        # 24h traffic bar chart
│   ├── sparkline.tsx               # Mini trend line
│   └── sidebar-nav.tsx             # Dashboard navigation
│
├── lib/
│   ├── scoring.ts                  # Core scoring algorithm
│   ├── google-traffic.ts           # Google Routes API integration
│   └── foursquare-places.ts        # Overpass API nearby places
│
└── db/
    ├── client.ts                   # Neon connection pool
    ├── queries.ts                  # All DB reads/writes
    └── schema.sql                  # Full schema + seed data
```

---

## Database schema

Six tables in Neon PostgreSQL:

```
locations         — physical billboard sites (lat/lng, name, address)
billboards        — structure specs (road_type, size, height_m, angle)
analyses          — scoring results linked to a billboard
traffic_snapshots — cached Google Routes API responses per location
nearby_places     — OSM Overpass points of interest within 500m
pricing_history   — historical price tracking per billboard
```

Plus the four NextAuth tables: `users`, `accounts`, `sessions`, `verification_token`.

---

## Scoring model

```
trafficScore  = congestion × 0.4  +  roadTypeWeight × 0.3  +  (1 − speed/120) × 0.3
footScore     = (nearbyCount/50) × 0.5  +  avgCategoryWeight × 0.5
compositeScore = (trafficScore × 0.6 + footScore × 0.4) × visibilityFactor
```

**Road type weights:** highway 1.0 · arterial 0.8 · collector 0.55 · local 0.3

**Visibility factor:** size factor × angle factor × height factor (2–20m range)

**Grade thresholds:**

| Grade | Composite score |
|---|---|
| PREMIUM | ≥ 0.80 |
| HIGH | ≥ 0.60 |
| MEDIUM | ≥ 0.40 |
| LOW | < 0.40 |

**Pricing:** `(dailyImpressions / 1000) × CPM × 30` — default CPM is TZS 2,500. Range is ±25%/+35% of suggested.

---

## Data sources

### Traffic — Google Routes API
Probes a 500m segment centred on the billboard using `TRAFFIC_AWARE_OPTIMAL`. Congestion is the ratio of traffic-aware duration to free-flow duration. Falls back to road-type defaults if `GOOGLE_MAPS_API_KEY` is not set.

### Nearby places — OpenStreetMap Overpass API
Queries `amenity`, `shop`, `tourism`, and `leisure` nodes within 500m of the pin. No API key required. Places are classified into 10 categories (finance, transport, retail, food, hospitality, education, healthcare, landmark, government, other) and weighted accordingly. Results are sorted by distance and capped at 20.

**Important:** Overpass requires a `User-Agent` header on server-side requests. The fetch in `foursquare-places.ts` includes one — removing it causes 406 errors.

### Geocoding — Nominatim
Used for two things: (1) reverse geocoding the dropped pin to auto-detect road type from OSM highway tags, and (2) forward search restricted to Tanzania (`countrycodes=tz`).

---

## Local setup

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A Google Cloud project with **Maps JavaScript API**, **Routes API**, and **OAuth 2.0** enabled

### 1. Clone and install

```bash
git clone https://github.com/mxsafiri/BBiq.git
cd billboard-intelligence
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BillboardIQ
NEXT_PUBLIC_DEFAULT_CITY=Dar es Salaam
NEXT_PUBLIC_DEFAULT_LAT=-6.8161
NEXT_PUBLIC_DEFAULT_LNG=39.2894

# Auth (NextAuth v5)
AUTH_SECRET=           # openssl rand -base64 32
AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Maps / Routes API
GOOGLE_MAPS_API_KEY=

# Pricing
CPM_RATE_TZS=2500
```

### 3. Set up the database

Run the schema against your Neon database:

```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Netlify

1. Connect the GitHub repo in Netlify
2. Set all environment variables from `.env.local` in **Site settings → Environment variables**
3. **Critical:** set `AUTH_URL=https://your-site.netlify.app` — NextAuth v5 uses `AUTH_URL`, not `NEXTAUTH_URL`. Without this, sign-in will fail in production.
4. Add your Netlify domain to **Google Cloud Console → OAuth 2.0 → Authorised redirect URIs**: `https://your-site.netlify.app/api/auth/callback/google`

The `@netlify/plugin-nextjs` plugin is already configured in `package.json`.

---

## Key implementation notes

- **No mock data for nearby places.** The Overpass API returns real OSM nodes. If a location has no tagged nodes within 500m, the nearby places section will be empty rather than showing fabricated data.
- **Traffic fallback is intentional.** When `GOOGLE_MAPS_API_KEY` is missing, traffic uses road-type defaults (congestion and speed values per road class). This keeps the scoring functional without an API key.
- **Analyses are immutable snapshots.** Once saved, an analysis reflects traffic and place data at the time of creation. Re-running an analysis on the same location creates a new record.
- **PDF export** is handled by `/report/[id]` — a standalone page outside the dashboard layout that calls `window.print()` automatically. Use browser print → Save as PDF.

---

## License

Private — all rights reserved.
