export interface TrafficData {
  congestionLevel: number;   // 0–1
  avgSpeedKph: number;
  durationSeconds: number;
  staticDurationSeconds: number;
  source: 'google' | 'mock';
}

/**
 * Fetch real-time traffic data for a location using the Google Routes API.
 * Measures congestion by comparing traffic-aware duration vs free-flow duration
 * over a short 500m probe segment centred on the billboard.
 *
 * Falls back to road-type defaults when GOOGLE_MAPS_API_KEY is not set.
 */
export async function fetchTrafficData(
  lat: number,
  lng: number,
  roadType: string
): Promise<TrafficData> {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    return getMockTraffic(roadType);
  }

  try {
    // Probe: origin = billboard, destination = 500m north
    const origin      = { latLng: { latitude: lat,        longitude: lng } };
    const destination = { latLng: { latitude: lat + 0.0045, longitude: lng } };

    const res = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type':    'application/json',
          'X-Goog-Api-Key':  key,
          'X-Goog-FieldMask': 'routes.duration,routes.staticDuration',
        },
        body: JSON.stringify({
          origin:            { location: origin },
          destination:       { location: destination },
          travelMode:        'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        }),
      }
    );

    if (!res.ok) throw new Error(`Routes API ${res.status}`);

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) throw new Error('No routes returned');

    // duration format: "Xs" (seconds string)
    const traffic = parseInt(route.duration?.replace('s', '') ?? '0', 10);
    const free    = parseInt(route.staticDuration?.replace('s', '') ?? '0', 10);

    if (!free || !traffic) throw new Error('Invalid durations');

    // Congestion = how much slower vs free-flow, capped at 1
    const delay = Math.max(0, traffic - free);
    const congestionLevel = Math.min(1, delay / free);

    // Estimate avg speed: 500m probe segment / traffic duration
    const avgSpeedKph = Math.round((0.5 / (traffic / 3600)) * 10) / 10;

    return { congestionLevel, avgSpeedKph, durationSeconds: traffic, staticDurationSeconds: free, source: 'google' };
  } catch (err) {
    console.warn('[google-traffic] falling back to mock:', (err as Error).message);
    return getMockTraffic(roadType);
  }
}

function getMockTraffic(roadType: string): TrafficData {
  const defaults: Record<string, TrafficData> = {
    highway:   { congestionLevel: 0.55, avgSpeedKph: 65, durationSeconds: 28, staticDurationSeconds: 18, source: 'mock' },
    arterial:  { congestionLevel: 0.72, avgSpeedKph: 28, durationSeconds: 64, staticDurationSeconds: 36, source: 'mock' },
    collector: { congestionLevel: 0.60, avgSpeedKph: 38, durationSeconds: 47, staticDurationSeconds: 30, source: 'mock' },
    local:     { congestionLevel: 0.40, avgSpeedKph: 25, durationSeconds: 72, staticDurationSeconds: 52, source: 'mock' },
  };
  return defaults[roadType] ?? defaults.arterial;
}
