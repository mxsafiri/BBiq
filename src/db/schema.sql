-- ============================================================
-- Billboard Intelligence Platform — Database Schema
-- ============================================================

-- Locations: physical billboard sites
CREATE TABLE IF NOT EXISTS locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  city        TEXT NOT NULL DEFAULT 'Dar es Salaam',
  country     TEXT NOT NULL DEFAULT 'TZ',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billboards: physical structures at a location
CREATE TABLE IF NOT EXISTS billboards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  road_type     TEXT NOT NULL CHECK (road_type IN ('highway','arterial','collector','local')),
  size          TEXT NOT NULL DEFAULT '8x4',
  height_m      NUMERIC(5,2) NOT NULL DEFAULT 6,
  angle         TEXT NOT NULL DEFAULT 'perpendicular',
  owner_name    TEXT,
  owner_contact TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analyses: scoring results for a billboard
CREATE TABLE IF NOT EXISTS analyses (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billboard_id              UUID NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
  traffic_score             NUMERIC(5,4) NOT NULL,
  foot_score                NUMERIC(5,4) NOT NULL,
  visibility_factor         NUMERIC(5,4) NOT NULL,
  composite_score           NUMERIC(5,4) NOT NULL,
  daily_impressions         INTEGER NOT NULL,
  weekly_impressions        INTEGER NOT NULL,
  monthly_impressions       INTEGER NOT NULL,
  exposure_time_seconds     INTEGER NOT NULL,
  suggested_price_tzs       BIGINT NOT NULL,
  price_low_tzs             BIGINT NOT NULL,
  price_high_tzs            BIGINT NOT NULL,
  cpm_rate_tzs              INTEGER NOT NULL DEFAULT 2500,
  score_grade               TEXT NOT NULL CHECK (score_grade IN ('LOW','MEDIUM','HIGH','PREMIUM')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Traffic snapshots: cached traffic data per location
CREATE TABLE IF NOT EXISTS traffic_snapshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  congestion_level NUMERIC(4,3) NOT NULL,
  avg_speed_kph    NUMERIC(6,2) NOT NULL,
  peak_hours       JSONB,
  source           TEXT NOT NULL DEFAULT 'mock',
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nearby places: activity hotspots near a location
CREATE TABLE IF NOT EXISTS nearby_places (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  category_weight  NUMERIC(4,3) NOT NULL,
  distance_m       INTEGER NOT NULL,
  place_lat        DOUBLE PRECISION,
  place_lng        DOUBLE PRECISION,
  source           TEXT NOT NULL DEFAULT 'mock',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing history: track how suggested prices change over time
CREATE TABLE IF NOT EXISTS pricing_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billboard_id        UUID NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
  price_monthly_tzs   BIGINT NOT NULL,
  cpm_rate_tzs        INTEGER NOT NULL DEFAULT 2500,
  daily_impressions   INTEGER NOT NULL,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_billboards_location ON billboards(location_id);
CREATE INDEX IF NOT EXISTS idx_analyses_billboard  ON analyses(billboard_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created    ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_location    ON traffic_snapshots(location_id);
CREATE INDEX IF NOT EXISTS idx_places_location     ON nearby_places(location_id);
CREATE INDEX IF NOT EXISTS idx_pricing_billboard   ON pricing_history(billboard_id);
CREATE INDEX IF NOT EXISTS idx_locations_city      ON locations(city);

-- ── Seed: 3 sample Dar es Salaam locations ───────────────────
INSERT INTO locations (id, name, address, lat, lng) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Askari Monument Junction', 'Samora Avenue, Dar es Salaam', -6.8161, 39.2894),
  ('a1000000-0000-0000-0000-000000000002', 'Kariakoo Market',          'Msimbazi Street, Dar es Salaam', -6.8235, 39.2777),
  ('a1000000-0000-0000-0000-000000000003', 'Ubungo Interchange',       'Morogoro Road, Dar es Salaam', -6.7924, 39.2083)
ON CONFLICT (id) DO NOTHING;

INSERT INTO billboards (id, location_id, road_type, size, height_m, angle) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'arterial', '8x4',  6,  'perpendicular'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'collector','8x4',  5,  'angled-45'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'highway',  '12x4', 8,  'perpendicular')
ON CONFLICT (id) DO NOTHING;
