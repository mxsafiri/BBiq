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

function classify(categoryName: string): string {
  const n = categoryName.toLowerCase();
  if (/\b(bank|atm|credit union|finance)\b/.test(n))                  return 'finance';
  if (/\b(bus|transit|metro|subway|train|rail|taxi|ferry|airport)\b/.test(n)) return 'transport';
  if (/\b(mall|market|shop|store|supermarket|retail|boutique)\b/.test(n))     return 'retail';
  if (/\b(restaurant|cafe|coffee|bar|food|diner|pub|bakery)\b/.test(n))       return 'food';
  if (/\b(hotel|lodging|motel|hostel|guesthouse|resort)\b/.test(n))           return 'hospitality';
  if (/\b(school|university|college|campus|academy)\b/.test(n))               return 'education';
  if (/\b(hospital|clinic|pharmacy|medical|doctor|dental)\b/.test(n))         return 'healthcare';
  if (/\b(museum|stadium|attraction|monument|park|landmark|gallery)\b/.test(n)) return 'landmark';
  if (/\b(government|embassy|consulate|ministry|court)\b/.test(n))            return 'government';
  return 'other';
}

/**
 * Fetch nearby places via Foursquare Places API.
 * Falls back to empty array (caller uses NEARBY_PLACES mock) when key is absent.
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusM = 500
): Promise<NearbyPlace[]> {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) return [];

  try {
    const url = new URL('https://places-api.foursquare.com/places/search');
    url.searchParams.set('ll', `${lat},${lng}`);
    url.searchParams.set('radius', String(radiusM));
    url.searchParams.set('limit', '20');

    const res = await fetch(url, {
      headers: {
        'Authorization':         `Bearer ${key}`,
        'X-Places-Api-Version':  '2025-06-17',
        'Accept':                'application/json',
      },
    });

    if (!res.ok) throw new Error(`Foursquare ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const results: any[] = data.results ?? [];

    return results.map(r => {
      const catName = r.categories?.[0]?.name ?? 'Other';
      const category = classify(catName);
      const weight   = CATEGORY_WEIGHTS[category] ?? 0.55;
      const distM    = typeof r.distance === 'number' ? r.distance : 0;

      return {
        name:     r.name ?? 'Unknown',
        category: category.charAt(0).toUpperCase() + category.slice(1),
        weight,
        distance: `${distM}m`,
      };
    });
  } catch (err) {
    console.warn('[foursquare] falling back to mock:', (err as Error).message);
    return [];
  }
}
