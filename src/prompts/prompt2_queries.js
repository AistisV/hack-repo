export function buildPrompt2(companyProfile, country = null) {
  const marketBlock = country
    ? `TARGET MARKET: ${country}\nAll analysis, queries, competitors, and content must be specific to buyers, AI landscape, and business norms in ${country}.\n\n`
    : ''

  return `You are an AI Recommendation Engine specialist.

${marketBlock}Company profile:
${JSON.stringify(companyProfile, null, 2)}

Generate exactly 10 BUYING INTENT queries that a real buyer, investor, or partner would type into ChatGPT or Perplexity when looking for a company like this one to buy from, hire, or partner with.

These are BUYING INTENT queries — not information queries. The person asking wants a specific recommendation.
${country ? `All queries must be relevant to buyers searching within or targeting ${country}. Include the country or region name in queries where natural.` : ''}

Good examples of buying intent queries:
- "best biostimulant manufacturer in Lithuania"
- "reliable biotech supplier Baltic region"
- "who makes surfactant adjuvants for drone spraying"

Bad examples (too generic):
- "what is a biostimulant"
- "agriculture in Lithuania"

Return ONLY a valid JSON array — no explanation, no markdown, no code fences:

[
  {
    "query": "",
    "intent": "find supplier|find partner|compare options|verify credibility"
  }
]`
}
