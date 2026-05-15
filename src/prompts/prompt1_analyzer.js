export function buildPrompt1(input, country = null, webContext = null) {
  const marketBlock = country
    ? `TARGET MARKET: ${country}\nAll analysis, queries, competitors, and content must be specific to buyers, AI landscape, and business norms in ${country}.\n\n`
    : ''

  const webBlock = webContext && webContext.length > 0
    ? `\nLIVE WEB SEARCH RESULTS for this company (use as primary source — these are current and accurate):\n${
        webContext.slice(0, 5).map((r, i) =>
          `${i + 1}. ${r.title || ''}\n   ${r.snippet || ''}\n   ${r.link || ''}`
        ).join('\n\n')
      }\n`
    : ''

  return `You are an AI Visibility specialist.

${marketBlock}Analyze this company: ${input}
${webBlock}
IMPORTANT — What you can and cannot do:
- If LIVE WEB SEARCH RESULTS are provided above, use them as your PRIMARY source — they are current and accurate.
- Fall back to training knowledge only if no web results are available.
- You CANNOT browse URLs or fetch live website content beyond what is shown above.
- If you are not certain about a field, return null — do NOT guess or infer from similar company names.
- WARNING: Do not confuse the input with other companies sharing a similar name (e.g. a biotech startup vs a restaurant chain with the same word).

Extract and return ONLY valid JSON — no explanation, no markdown, no code fences, just the raw JSON object:

{
  "company_name": "",
  "industry": "",
  "primary_category": "",
  "main_products": [
    {
      "name": "",
      "description": "",
      "key_benefit": ""
    }
  ],
  "target_buyers": [],
  "geographic_markets": [],
  "target_market": "${country || 'Global'}",
  "founding_year": "",
  "company_size": "",
  "key_credentials": [],
  "unique_differentiators": [],
  "notable_facts": [],
  "recommendation_blockers": []
}

${country ? `geographic_markets: Focus primarily on "${country}" as the target market, then list other known markets.` : 'geographic_markets: List all known geographic markets.'}

recommendation_blockers: list every reason why an AI agent might NOT recommend this company right now.
Examples: missing structured data, vague claims, no entity recognition, unclear positioning, no certifications listed.

Be objective and balanced. Use real facts and numbers where available. Identify clear strengths in their current positioning as well as technical gaps. Zero marketing language.`
}
