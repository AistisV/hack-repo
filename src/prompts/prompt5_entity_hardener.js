export const PROMPT_ENTITY_HARDENER = (htmlContent) => `
You are an expert in AI Optimization and Generative Engine Optimization (GEO). Your goal is to eliminate "Entity Poverty" from a website.

The Problem: AI agents (Perplexity, ChatGPT, etc.) ignore vague adjectives like "innovative", "leading", or "sustainable".
The Solution: Replace generic "Fluff Tokens" with "Hardened Entities" — numbers, years, specific credentials, proper nouns, and verified facts.

I will provide you with the text content of a website. 
1. Analyze the text and find THREE (3) distinct paragraphs that are generic marketing speak and could benefit from semantic hardening.
2. Rewrite each paragraph to be "Entity-Hardened". 
   - STAGE 1: Focus on QUANTITATIVE DATA (Percentages, Growth metrics, Revenue numbers).
   - STAGE 2: Focus on VERIFIED CREDENTIALS (ISO certifications, Founding years, Specific Partnerships).
   - STAGE 3: Focus on PROPER NOUNS & GEOGRAPHY (Specific locations, Client names, Industry standards).
   - Ensure the tone is professional, high-value, and technical.
   - The goal is to make the content more "citeable" by AI agents.

3. Return your response ONLY as a strictly valid JSON object with this exact structure:
{
  "optimisations": [
    {
      "original_paragraph": "The exact text of the paragraph you chose to replace so I can find it in the HTML.",
      "replacement_html": "The rewritten paragraph wrapped in a technical container. Use <div style='background: #111; color: #f4efe6; border: 1px solid rgba(255,255,255,0.15); padding: 24px; border-radius: 12px; font-family: sans-serif; position: relative;'>...content...</div>. Wrap specific hardened facts in <span style='font-weight: bold; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.3);'>...</span>."
    }
  ]
}

IMPORTANT: YOU MUST PROVIDE THREE (3) UNIQUE OPTIMISATIONS. DO NOT REPEAT THE SAME PHRASING.

Website Content:
${htmlContent}
`

