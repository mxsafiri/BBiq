export type RoadType = 'highway' | 'arterial' | 'collector' | 'local';

const ROAD_WEIGHTS: Record<RoadType, number> = {
  highway: 1.0,
  arterial: 0.8,
  collector: 0.55,
  local: 0.3,
};

export interface ScoringInput {
  congestionLevel: number; // 0–1
  roadType: RoadType;
  avgSpeedKph: number;
  nearbyPlacesCount: number;
  categoryWeight: number; // 0–1 (based on place types)
  visibilityFactor: number; // 0–1 (size, height, angle)
  cpmRateTZS?: number;
}

export interface ScoringResult {
  trafficScore: number;
  footScore: number;
  compositeScore: number;
  dailyImpressions: number;
  weeklyImpressions: number;
  monthlyImpressions: number;
  suggestedPriceMonthlyTZS: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  exposureTimeSeconds: number;
}

export function score(input: ScoringInput): ScoringResult {
  const {
    congestionLevel,
    roadType,
    avgSpeedKph,
    nearbyPlacesCount,
    categoryWeight,
    visibilityFactor,
    cpmRateTZS = 2500,
  } = input;

  const roadTypeWeight = ROAD_WEIGHTS[roadType];
  const avgSpeedInverse = Math.max(0, 1 - avgSpeedKph / 120);

  const trafficScore =
    congestionLevel * 0.4 + roadTypeWeight * 0.3 + avgSpeedInverse * 0.3;

  const normalizedPlaces = Math.min(1, nearbyPlacesCount / 50);
  const footScore = normalizedPlaces * 0.5 + categoryWeight * 0.5;

  const compositeScore = (trafficScore * 0.6 + footScore * 0.4) * visibilityFactor;

  const dailyImpressions = Math.round(compositeScore * 95000);
  const weeklyImpressions = dailyImpressions * 7;
  const monthlyImpressions = dailyImpressions * 30;

  const suggestedPriceMonthlyTZS = Math.round((dailyImpressions / 1000) * cpmRateTZS * 30);
  const priceRangeLow = Math.round(suggestedPriceMonthlyTZS * 0.75);
  const priceRangeHigh = Math.round(suggestedPriceMonthlyTZS * 1.35);

  // Avg exposure = 1000 / avg_speed_kph * 3.6 seconds (billboard ~100m visible zone)
  const exposureTimeSeconds = avgSpeedKph > 0 ? Math.round((100 / (avgSpeedKph / 3.6))) : 30;

  return {
    trafficScore: Math.min(1, trafficScore),
    footScore: Math.min(1, footScore),
    compositeScore: Math.min(1, compositeScore),
    dailyImpressions,
    weeklyImpressions,
    monthlyImpressions,
    suggestedPriceMonthlyTZS,
    priceRangeLow,
    priceRangeHigh,
    exposureTimeSeconds,
  };
}
