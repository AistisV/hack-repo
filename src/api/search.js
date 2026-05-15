import { supabase } from '../lib/supabase'

const SERPER_URL = 'https://google.serper.dev/search'

const COUNTRY_CODES = {
  'United States': 'us',
  'Germany': 'de',
  'United Kingdom': 'gb',
  'France': 'fr',
  'Netherlands': 'nl',
  'Sweden': 'se',
  'Denmark': 'dk',
  'Finland': 'fi',
  'Norway': 'no',
  'Poland': 'pl',
  'Spain': 'es',
  'Italy': 'it',
  'Belgium': 'be',
  'Switzerland': 'ch',
  'Australia': 'au',
  'Canada': 'ca',
  'Japan': 'jp',
  'South Korea': 'kr',
  'Brazil': 'br',
  'India': 'in',
}

export async function searchWeb(query, country = null) {
  const apiKey = import.meta.env.VITE_SERPER_API_KEY
  if (!apiKey || apiKey === 'your_serper_api_key_here') return null

  const cacheKey = `search_${query}_${country || 'any'}`;

  // 1. Check Global Cache (Supabase)
  try {
    const { data: cached, error } = await supabase
      .from('api_cache')
      .select('response_json')
      .eq('cache_key', cacheKey)
      .single();

    if (cached && !error) {
      console.log("AIO: Using GLOBAL cached Search response");
      return cached.response_json.results;
    }
  } catch (err) {
    console.warn("AIO: Supabase search cache lookup failed", err);
  }

  // 2. Check Local Cache Fallback
  const localCacheKey = `nando_search_${query}_${country || 'any'}`;
  const localCached = localStorage.getItem(localCacheKey);
  if (localCached) {
    console.log("AIO: Using local cached Search response");
    try {
      return JSON.parse(localCached);
    } catch (e) {
      console.warn("AIO: Failed to parse local search cache");
    }
  }

  // 3. Fresh API Call
  const body = { q: query, num: 10 }
  if (country && COUNTRY_CODES[country]) body.gl = COUNTRY_CODES[country]

  const response = await fetch(SERPER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) return null
  const data = await response.json()
  const results = data.organic || [];

  // 4. Save to Global & Local Cache
  try {
    localStorage.setItem(localCacheKey, JSON.stringify(results));
    
    supabase
      .from('api_cache')
      .upsert({ cache_key: cacheKey, response_json: { results } })
      .then(({ error }) => {
        if (error) console.warn("AIO: Failed to save search to global cache", error);
      });
  } catch (e) {
    console.warn("AIO: Search cache update error", e);
  }

  return results;
}

export function scoreWebResult(companyName, organicResults) {
  if (!organicResults || organicResults.length === 0) return 'none'

  const name = companyName.toLowerCase()
  const check = (results) =>
    results.some(r =>
      `${r.title || ''} ${r.snippet || ''} ${r.link || ''}`.toLowerCase().includes(name)
    )

  if (check(organicResults.slice(0, 3))) return 'strong'
  if (check(organicResults)) return 'weak'
  return 'none'
}
