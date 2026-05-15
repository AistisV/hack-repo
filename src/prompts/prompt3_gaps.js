export function buildPrompt3(companyProfile, realAnswers, country = null, entityPresence = []) {
  const marketBlock = country
    ? `TARGET MARKET: ${country}\nAll analysis must be specific to buyers, AI landscape, and business norms in ${country}.\n\n`
    : ''

  const companyName = companyProfile.company_name || 'the company'

  const answersBlock = realAnswers.map((r, i) =>
    `Query ${i + 1}: "${r.query}"\nClaude's actual answer: ${r.answer || '(no answer)'}`
  ).join('\n\n')

  const entityBlock = entityPresence.length > 0
    ? `\nEntity platform presence (verified via web search):\n${entityPresence.map(e => `- ${e.name}: ${e.present ? 'PRESENT' : 'MISSING'}`).join('\n')}\n`
    : ''

  return `You are an AI Visibility specialist.

${marketBlock}Company being analyzed: ${companyName}

Company profile:
${JSON.stringify(companyProfile, null, 2)}
${entityBlock}
Below are REAL answers that Claude gave when asked each buying intent query. These are not simulations — this is what Claude actually says today.

${answersBlock}

For each query:
1. Check if "${companyName}" is mentioned in Claude's actual answer
2. If mentioned as a top recommendation → "strong"
3. If mentioned but not prominently → "weak"
4. If not mentioned at all → "none"
5. Identify which competitor Claude recommended instead (if any)
6. Identify what specific content or signal is missing that caused ${companyName} to be excluded

Return ONLY valid JSON — no explanation, no markdown, no code fences:

{
  "target_market": "${country || 'Global'}",
  "overall_recommendation_score": 0,
  "score_explanation": "",
  "content_quality_score": 0,
  "entity_signals_score": 0,
  "authority_score": 0,
  "query_results": [
    {
      "query": "",
      "would_recommend": false,
      "recommendation_strength": "strong|weak|none",
      "blocking_reason": "",
      "competitor_recommended_instead": "",
      "fix_needed": ""
    }
  ],
  "most_damaging_gap": "",
  "top_competitors": [
    { "name": "", "query_count": 0 }
  ],
  "competitor_winning_most": "",
  "quick_wins": [
    { "action": "", "layer": "", "impact": "" }
  ]
}

Scoring rules:
- overall_recommendation_score: 0-10 integer based on how often Claude actually mentioned ${companyName} across all queries
- content_quality_score: 0-10. Assess based on the company profile: Do they have clear FAQ-style content? Direct answers to buyer questions? Question-based headings? Deduct points for vague positioning, no structured Q&A, no "why choose us" specifics.
- entity_signals_score: 0-10. Based on entity platform presence provided above. Full presence on G2/Capterra/LinkedIn/Wikipedia/Crunchbase/Trustpilot = 10. Each missing high-priority platform = -1.5 to -2 points depending on industry relevance.
- authority_score: 0-10. Assess from profile: Does the company have original data, published research, named credentials, certifications, case studies, or press mentions? Deduct for generic claims with no proof.

top_competitors: list up to 3 competitors that appeared most often across Claude's actual answers. Include query_count (how many of the ${realAnswers.length} queries they appeared in).

quick_wins: exactly 3. Each must:
- name the specific action to take
- reference which LLM SEO layer it fixes (Discovery / Content Structure / Answer Optimization / Brand Signals / Authority & Trust / Technical Foundation)
- state the expected impact in one sentence
Example: { "action": "Create a G2 profile using the Entity Sheet from your content pack", "layer": "Brand Signals", "impact": "G2 is a primary LLM training source — presence here directly increases recommendation frequency." }`
}
