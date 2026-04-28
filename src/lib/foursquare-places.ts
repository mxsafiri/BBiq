export interface NearbyPlace {
  name: string;
  category: string;
  weight: number;
  distance: string;
}

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

function classify(tags: Record<string, string>): string {
  const amenity = tags.amenity ?? '';
  const shop    = tags.shop    ?? '';
  const tourism = tags.tourism ?? '';
  const leisure = tags.leisure ?? '';

  if (['bank', 'atm', 'bureau_de_change'].includes(amenity))                              return 'finance';
  if (['bus_station', 'ferry_terminal', 'taxi', 'fuel'].includes(amenity))               return 'transport';
  if (['bus_stop', 'stop_position'].includes(amenity))                                    return 'transport';
  if (shop && ['supermarket','mall','convenience','clothes','hardware','electronics','market'].includes(shop)) return 'retail';
  if (shop)                                                                                return 'retail';
  if (['restaurant','cafe','bar','fast_food','food_court','pub'].includes(amenity))       return 'food';
  if (['hotel','hostel','guest_house','motel'].includes(tourism))                         return 'hospitality';
  if (['school','university','college','kindergarten'].includes(amenity))                 return 'education';
  if (['hospital','clinic','pharmacy','doctors','dentist'].includes(amenity))             return 'healthcare';
  if (['place_of_worship','theatre','cinema','arts_centre'].includes(amenity))            return 'landmark';
  if (['museum','attraction','viewpoint','gallery'].includes(tourism))                    return 'landmark';
  if (['park','stadium','sports_centre'].includes(leisure))                               return 'landmark';
  if (['townhall','courthouse','police','post_office','embassy'].includes(amenity))       return 'government';
  return 'other';
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Fetch real nearby places from OpenStreetMap via the Overpass API.
 * Free, no API key required, comprehensive coverage across Tanzania.
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusM = 500
): Promise<NearbyPlace[]> {
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"](around:${radiusM},${lat},${lng});
      node["shop"](around:${radiusM},${lat},${lng});
      node["tourism"](around:${radiusM},${lat},${lng});
      node["leisure"~"^(park|stadium|sports_centre)$"](around:${radiusM},${lat},${lng});
    );
    out body;
  `.trim();

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) throw new Error(`Overpass ${res.status}`);

    const data  = await res.json();
    const elements: any[] = data.elements ?? [];

    return elements
      .filter(el => el.tags?.name)
      .map(el => {
        const tags     = el.tags as Record<string, string>;
        const category = classify(tags);
        const distM    = haversineM(lat, lng, el.lat, el.lon);
        return {
          name:     tags.name,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          weight:   CATEGORY_WEIGHTS[category] ?? 0.55,
          distance: `${distM}m`,
        };
      })
      .sort((a, b) => parseInt(a.distance) - parseInt(b.distance))
      .slice(0, 20);
  } catch (err) {
    console.warn('[overpass] nearby places failed:', (err as Error).message);
    return [];
  }
}
