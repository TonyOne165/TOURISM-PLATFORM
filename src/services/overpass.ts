// Overpass API wrapper for dynamic cities + tourist places (OpenStreetMap).
// Free, no API key. Rate limited (~5 req/min for heavy queries).

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const cache = new Map<string, unknown>();

export interface OverpassCity {
  name: string;
  lat: number;
  lng: number;
  population?: number;
}

export interface OverpassPlace {
  name: string;
  lat: number;
  lng: number;
  type: 'landmark' | 'beach' | 'museum' | 'restaurant' | 'park' | 'other';
  description?: string;
}

// Country name → ISO 3166-1 alpha-2. Extend as needed.
export const COUNTRY_ISO: Record<string, string> = {
  Colombia: 'CO', USA: 'US', 'United States': 'US', Canada: 'CA', Mexico: 'MX',
  Brazil: 'BR', Argentina: 'AR', France: 'FR', Spain: 'ES', Italy: 'IT',
  Japan: 'JP', China: 'CN', UK: 'GB', 'United Kingdom': 'GB', Germany: 'DE',
  Australia: 'AU', Egypt: 'EG', India: 'IN', Russia: 'RU', Peru: 'PE',
  Chile: 'CL', Venezuela: 'VE', Ecuador: 'EC', Guatemala: 'GT', Cuba: 'CU',
  Uruguay: 'UY', Bolivia: 'BO', Norway: 'NO', Sweden: 'SE', Poland: 'PL',
  Ukraine: 'UA', 'South Africa': 'ZA', Nigeria: 'NG', Kenya: 'KE',
  Morocco: 'MA', Algeria: 'DZ', Libya: 'LY', Ethiopia: 'ET', Ghana: 'GH',
  'South Korea': 'KR', Thailand: 'TH', Indonesia: 'ID', 'Saudi Arabia': 'SA',
  Iran: 'IR', Turkey: 'TR', Kazakhstan: 'KZ', Mongolia: 'MN', Pakistan: 'PK',
  Afghanistan: 'AF', Vietnam: 'VN', Myanmar: 'MM', 'New Zealand': 'NZ',
  'Papua New Guinea': 'PG',
};

async function runOverpass<T>(query: string, cacheKey: string): Promise<T[]> {
  if (cache.has(cacheKey)) return cache.get(cacheKey) as T[];
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.elements || [];
  } catch (err) {
    console.warn('Overpass query failed:', err);
    return [];
  }
}

export async function fetchCitiesForCountry(countryName: string): Promise<OverpassCity[]> {
  const iso = COUNTRY_ISO[countryName];
  if (!iso) return [];
  const key = `cities:${iso}`;
  if (cache.has(key)) return cache.get(key) as OverpassCity[];

  const query = `
    [out:json][timeout:30];
    area["ISO3166-1"="${iso}"]->.country;
    (
      node["place"="city"](area.country);
      node["place"="town"]["population"~"^[1-9][0-9]{4,}$"](area.country);
    );
    out body 150;
  `;
  const elements = await runOverpass<{ lat: number; lon: number; tags: Record<string, string> }>(query, `_${key}`);
  const cities: OverpassCity[] = elements
    .filter(el => el.tags?.name)
    .map(el => ({
      name: el.tags['name:es'] || el.tags.name,
      lat: el.lat,
      lng: el.lon,
      population: el.tags.population ? parseInt(el.tags.population, 10) : undefined,
    }))
    .sort((a, b) => (b.population || 0) - (a.population || 0));
  cache.set(key, cities);
  return cities;
}

export async function fetchTouristPlaces(lat: number, lng: number, radiusMeters = 15000): Promise<OverpassPlace[]> {
  const key = `tourism:${lat.toFixed(3)},${lng.toFixed(3)},${radiusMeters}`;
  if (cache.has(key)) return cache.get(key) as OverpassPlace[];

  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo|artwork"](around:${radiusMeters},${lat},${lng});
      node["historic"~"castle|monument|memorial|ruins|archaeological_site|fort"](around:${radiusMeters},${lat},${lng});
      node["natural"~"beach|peak|waterfall"](around:${radiusMeters},${lat},${lng});
      node["leisure"="park"](around:${radiusMeters},${lat},${lng});
    );
    out body 80;
  `;
  const elements = await runOverpass<{ lat: number; lon: number; tags: Record<string, string> }>(query, `_${key}`);
  const places: OverpassPlace[] = elements
    .filter(el => el.tags?.name)
    .map(el => {
      const t = el.tags;
      let type: OverpassPlace['type'] = 'other';
      if (t.tourism === 'museum' || t.tourism === 'gallery') type = 'museum';
      else if (t.tourism === 'theme_park' || t.leisure === 'park') type = 'park';
      else if (t.natural === 'beach') type = 'beach';
      else if (t.historic || t.tourism === 'attraction' || t.tourism === 'viewpoint') type = 'landmark';
      return {
        name: t['name:es'] || t.name,
        lat: el.lat,
        lng: el.lon,
        type,
        description: t['description:es'] || t.description || undefined,
      };
    });
  cache.set(key, places);
  return places;
}
