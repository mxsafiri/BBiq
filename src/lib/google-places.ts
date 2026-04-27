export interface NearbyPlace {
  name: string;
  category: string;
  weight: number;
  distance: string;
}

// Category → audience value weight
const CATEGORY_WEIGHTS: Record<string, number> = {
  finance:     0.85,
  transport:   0.90,
  retail:      0.80,
  food:        0.70,
  hospitality: 0.75,
  education:   0.65,
  healthcare:  0.75,
  landmark:    0.88,
  government:  0.72,
  other:       0.55,
};

const TYPE_TO_CATEGORY: Record<string, string> = {
  bank: 'finance', atm: 'finance',
  bus_station: 'transport', transit_station: 'transport', taxi_stand: 'transport', ferry_terminal: 'transport',
  shopping_mall: 'retail', supermarket: 'retail', store: 'retail',
  restaurant: 'food', cafe: 'food', food: 'food',
  lodging: 'hospitality', hotel: 'hospitality',
  university: 'education', school: 'education',
  hospital: 'healthcare', pharmacy: 'healthcare',
  tourist_attraction: 'landmark', museum: 'landmark', stadium: 'landmark',
  local_government_office: 'government', embassy: 'government',
};

/**
 * Fetch nearby places via Google Places API (New).
 * Falls back to NEARBY_PLACES mock data when key is absent.
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusM = 500
): Promise<NearbyPlace[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) return [];   // caller uses NEARBY_PLACES mock

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'X-Goog-Api-Key':  key,
        'X-Goog-FieldMask': 'places.displayName,places.types,places.location',
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radiusMeters: radiusM },
        },
        maxResultCount: 20,
      }),
    });

    if (!res.ok) throw new Error(`Places API ${res.status}`);

    const data = await res.json();
    const places: NearbyPlace[] = (data.places ?? []).map((p: any) => {
      const type     = (p.types ?? []).find((t: string) => TYPE_TO_CATEGORY[t]) ?? 'other';
      const category = TYPE_TO_CATEGORY[type] ?? 'other';
      const weight   = CATEGORY_WEIGHTS[category] ?? 0.55;

      // Distance from billboard
      const dlat = (p.location?.latitude ?? lat) - lat;
      const dlng = (p.location?.longitude ?? lng) - lng;
      const distM = Math.round(Math.sqrt(dlat * dlat + dlng * dlng) * 111320);

      return {
        name:     p.displayName?.text ?? 'Unknown',
        category: category.charAt(0).toUpperCase() + category.slice(1),
        weight,
        distance: `${distM}m`,
      };
    });

    return places;
  } catch (err) {
    console.warn('[google-places] falling back to mock:', (err as Error).message);
    return [];
  }
}
