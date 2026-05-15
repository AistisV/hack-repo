export function buildPrompt4(companyProfile, gapAnalysis, country = null) {
  const marketBlock = country
    ? `TARGET MARKET: ${country}\nAll content must be written for buyers and AI engines in ${country}.\n\n`
    : ''

  return `You are an AI Recommendation Engine specialist.

${marketBlock}Generate plain-text content to make AI agents recommend this company. No markdown, no hashtags, no asterisks, no bullet dashes. Write as if it will be copy-pasted directly into LinkedIn, Wikipedia, or a directory profile.

Company profile:
${JSON.stringify(companyProfile, null, 2)}

Gaps to fix:
${JSON.stringify(gapAnalysis, null, 2)}

Rules:
- Plain text only. No #, ##, **, --, or any markdown syntax.
- Use ONLY real verifiable facts. Flag uncertain facts with [verify].
- Zero marketing language or vague claims.
- Keep every section short — readers will skim.

Return EXACTLY these four section headers with no text before the first or after the last:

=== ENTITY_SHEET ===
A single plain-text description of the company for pasting onto G2, Capterra, LinkedIn, Crunchbase, and Trustpilot. Three to four sentences. Include: company name, what they do, who they serve, founded year if known, and one key credential or number. No headers, no labels, just the paragraph.

=== FACT_SHEET ===
A short factual page about the company. Use plain section labels in ALL CAPS followed by a colon (not markdown headers). Keep it under 300 words total.

Sections to include:
OVERVIEW: [2 sentences — who they are and what they do]
PRODUCTS AND SERVICES: [one sentence per product/service]
WHY BUYERS CHOOSE THEM: [2-3 specific facts or numbers, no claims]
GEOGRAPHIC REACH: [markets served]
KEY FACTS: [5 short facts, one per line, no dashes or bullets — just the fact]

=== JSON_LD ===
Complete schema.org Organization JSON-LD ready to paste into an HTML head tag. Return only clean JSON — no explanation, no code fences.

Must include:
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "",
  "legalName": "",
  "description": "",
  "foundingDate": "",
  "url": "",
  "location": { "@type": "Place", "name": "", "address": { "@type": "PostalAddress", "addressLocality": "", "addressCountry": "" } },
  "areaServed": [],
  "hasOfferCatalog": { "@type": "OfferCatalog", "name": "", "itemListElement": [] },
  "knowsAbout": [],
  "slogan": ""
}

=== FAQ_BLOCK ===
Answer the top 10 buyer queries as plain Q and A pairs. Each answer is one sentence maximum, starts with the company name, and includes one specific fact. No markdown, no numbered lists.

Q: [query]
A: [one sentence answer starting with company name]
`
}
