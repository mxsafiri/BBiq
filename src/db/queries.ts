import { sql } from './client';
import { score, type RoadType } from '@/lib/scoring';
import { NEARBY_PLACES, PEAK_HOURS } from '@/lib/mock-data';
import { fetchTrafficData } from '@/lib/google-traffic';
import { fetchNearbyPlaces } from '@/lib/google-places';

// ── Types ────────────────────────────────────────────────────

export interface CreateAnalysisInput {
  name: string;
  address: string;
  lat: number;
  lng: number;
  roadType: RoadType;
  size: string;
  heightM: number;
  angle: string;
}

export interface AnalysisSummary {
  id: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  roadType: string;
  size: string;
  compositeScore: number;
  scoreGrade: string;
  dailyImpressions: number;
  suggestedPriceTzs: number;
  createdAt: string;
}

export interface AnalysisDetail extends AnalysisSummary {
  billboardId: string;
  heightM: number;
  angle: string;
  trafficScore: number;
  footScore: number;
  visibilityFactor: number;
  weeklyImpressions: number;
  monthlyImpressions: number;
  exposureTimeSeconds: number;
  priceLowTzs: number;
  priceHighTzs: number;
  cpmRateTzs: number;
  nearbyPlaces: Array<{ name: string; category: string; distance: string; weight: number }>;
  peakHours: Array<{ hour: string; vehicles: number }>;
}

// ── Helpers ──────────────────────────────────────────────────

const ANGLE_FACTOR: Record<string, number> = {
  perpendicular: 1.0, 'angled-45': 0.85, parallel: 0.5, corner: 0.95,
};
const SIZE_FACTOR: Record<string, number> = {
  '4x3': 0.6, '6x4': 0.75, '8x4': 0.85, '12x4': 1.0, '14x5': 1.15,
};
const CONGESTION: Record<string, number> = {
  highway: 0.55, arterial: 0.72, collector: 0.60, local: 0.40,
};
const AVG_SPEED: Record<string, number> = {
  highway: 65, arterial: 28, collector: 38, local: 25,
};

// ── Queries ──────────────────────────────────────────────────

export async function createAnalysis(input: CreateAnalysisInput) {
  const { name, address, lat, lng, roadType, size, heightM, angle } = input;

  // 1. Upsert location (match by lat/lng rounded to 4 decimal places)
  const locRows = await sql`
    INSERT INTO locations (name, address, lat, lng)
    VALUES (${name}, ${address}, ${lat}, ${lng})
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  let locationId: string;
  if (locRows.length > 0) {
    locationId = locRows[0].id;
  } else {
    const existing = await sql`
      SELECT id FROM locations
      WHERE ROUND(lat::numeric, 4) = ROUND(${lat}::numeric, 4)
        AND ROUND(lng::numeric, 4) = ROUND(${lng}::numeric, 4)
      LIMIT 1
    `;
    locationId = existing[0]?.id;
    if (!locationId) throw new Error('Could not create or find location');
  }

  // 2. Create billboard
  const bbRows = await sql`
    INSERT INTO billboards (location_id, road_type, size, height_m, angle)
    VALUES (${locationId}, ${roadType}, ${size}, ${heightM}, ${angle})
    RETURNING id
  `;
  const billboardId: string = bbRows[0].id;

  // 3. Fetch real traffic + places (falls back to mock when no API key)
  const [trafficData, realPlaces] = await Promise.all([
    fetchTrafficData(lat, lng, roadType),
    fetchNearbyPlaces(lat, lng),
  ]);

  const placesToUse   = realPlaces.length > 0 ? realPlaces : NEARBY_PLACES;
  const avgCatWeight  = placesToUse.reduce((s, p) => s + p.weight, 0) / placesToUse.length;

  // 4. Compute scores
  const heightFactor = Math.min(1, 0.4 + (heightM / 20) * 0.6);
  const visibilityFactor =
    (SIZE_FACTOR[size] ?? 0.85) * (ANGLE_FACTOR[angle] ?? 0.85) * heightFactor;

  const result = score({
    congestionLevel:   trafficData.congestionLevel,
    roadType,
    avgSpeedKph:       trafficData.avgSpeedKph,
    nearbyPlacesCount: placesToUse.length,
    categoryWeight:    avgCatWeight,
    visibilityFactor,
  });

  const grade =
    result.compositeScore >= 0.8 ? 'PREMIUM' :
    result.compositeScore >= 0.6 ? 'HIGH' :
    result.compositeScore >= 0.4 ? 'MEDIUM' : 'LOW';

  // 4. Save analysis
  const anaRows = await sql`
    INSERT INTO analyses (
      billboard_id, traffic_score, foot_score, visibility_factor, composite_score,
      daily_impressions, weekly_impressions, monthly_impressions, exposure_time_seconds,
      suggested_price_tzs, price_low_tzs, price_high_tzs, score_grade
    ) VALUES (
      ${billboardId},
      ${result.trafficScore}, ${result.footScore}, ${visibilityFactor}, ${result.compositeScore},
      ${result.dailyImpressions}, ${result.weeklyImpressions}, ${result.monthlyImpressions},
      ${result.exposureTimeSeconds}, ${result.suggestedPriceMonthlyTZS},
      ${result.priceRangeLow}, ${result.priceRangeHigh}, ${grade}
    )
    RETURNING id
  `;
  const analysisId: string = anaRows[0].id;

  // 5. Save traffic snapshot (real or mock)
  await sql`
    INSERT INTO traffic_snapshots (location_id, congestion_level, avg_speed_kph, peak_hours, source)
    VALUES (
      ${locationId},
      ${trafficData.congestionLevel},
      ${trafficData.avgSpeedKph},
      ${JSON.stringify(PEAK_HOURS)},
      ${trafficData.source}
    )
  `;

  // 6. Save nearby places (real or mock)
  for (const place of placesToUse) {
    await sql`
      INSERT INTO nearby_places (location_id, name, category, category_weight, distance_m, source)
      VALUES (
        ${locationId},
        ${place.name},
        ${place.category},
        ${place.weight},
        ${parseInt(place.distance)},
        ${realPlaces.length > 0 ? 'google' : 'mock'}
      )
      ON CONFLICT DO NOTHING
    `;
  }

  return analysisId;
}

export async function getAnalyses(): Promise<AnalysisSummary[]> {
  const rows = await sql`
    SELECT
      a.id,
      l.name            AS location_name,
      l.address,
      l.lat,
      l.lng,
      b.road_type,
      b.size,
      a.composite_score,
      a.score_grade,
      a.daily_impressions,
      a.suggested_price_tzs,
      a.created_at
    FROM analyses a
    JOIN billboards b ON b.id = a.billboard_id
    JOIN locations  l ON l.id = b.location_id
    ORDER BY a.created_at DESC
    LIMIT 20
  `;

  return rows.map(r => ({
    id:                 r.id,
    locationName:       r.location_name,
    address:            r.address,
    lat:                parseFloat(r.lat),
    lng:                parseFloat(r.lng),
    roadType:           r.road_type,
    size:               r.size,
    compositeScore:     parseFloat(r.composite_score),
    scoreGrade:         r.score_grade,
    dailyImpressions:   r.daily_impressions,
    suggestedPriceTzs:  r.suggested_price_tzs,
    createdAt:          r.created_at,
  }));
}

export async function getAnalysisById(id: string): Promise<AnalysisDetail | null> {
  const rows = await sql`
    SELECT
      a.*,
      b.road_type, b.size, b.height_m, b.angle,
      l.name AS location_name, l.address, l.lat, l.lng,
      (
        SELECT json_agg(json_build_object(
          'name', np.name, 'category', np.category,
          'distance', np.distance_m || 'm', 'weight', np.category_weight
        ))
        FROM nearby_places np WHERE np.location_id = l.id
      ) AS nearby_places,
      (
        SELECT ts.peak_hours
        FROM traffic_snapshots ts
        WHERE ts.location_id = l.id
        ORDER BY ts.recorded_at DESC
        LIMIT 1
      ) AS peak_hours
    FROM analyses a
    JOIN billboards b ON b.id = a.billboard_id
    JOIN locations  l ON l.id = b.location_id
    WHERE a.id = ${id}
    LIMIT 1
  `;

  if (!rows.length) return null;
  const r = rows[0];

  return {
    id:                   r.id,
    billboardId:          r.billboard_id,
    locationName:         r.location_name,
    address:              r.address,
    lat:                  parseFloat(r.lat),
    lng:                  parseFloat(r.lng),
    roadType:             r.road_type,
    size:                 r.size,
    heightM:              parseFloat(r.height_m),
    angle:                r.angle,
    trafficScore:         parseFloat(r.traffic_score),
    footScore:            parseFloat(r.foot_score),
    visibilityFactor:     parseFloat(r.visibility_factor),
    compositeScore:       parseFloat(r.composite_score),
    scoreGrade:           r.score_grade,
    dailyImpressions:     r.daily_impressions,
    weeklyImpressions:    r.weekly_impressions,
    monthlyImpressions:   r.monthly_impressions,
    exposureTimeSeconds:  r.exposure_time_seconds,
    suggestedPriceTzs:    r.suggested_price_tzs,
    priceLowTzs:          r.price_low_tzs,
    priceHighTzs:         r.price_high_tzs,
    cpmRateTzs:           r.cpm_rate_tzs,
    createdAt:            r.created_at,
    nearbyPlaces:         r.nearby_places ?? [],
    peakHours:            r.peak_hours ?? PEAK_HOURS,
  };
}
