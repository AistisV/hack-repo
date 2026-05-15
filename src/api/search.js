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
  return data.organic || []
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
