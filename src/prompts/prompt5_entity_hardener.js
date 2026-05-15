export const PROMPT_ENTITY_HARDENER = (htmlContent) => `
You are an expert in AI Optimization (AIO) and Generative Engine Optimization (GEO). Your goal is to eliminate "Entity Poverty" from a website.

The Problem: AI agents (Perplexity, ChatGPT, etc.) ignore vague adjectives like "innovative", "leading", or "sustainable".
The Solution: Replace generic "Fluff Tokens" with "Hardened Entities" — numbers, years, specific credentials, proper nouns, and verified facts.

I will provide you with the text content of a website. 
1. Analyze the text and find ONE specific paragraph that is generic marketing speak and could benefit the most from AIO/GEO optimization.
2. Rewrite this paragraph to be "Entity-Hardened". 
   - Inject specific, high-value facts (e.g., instead of "long track record", use "founded in 2012 with 500+ successful deployments").
   - Ensure the tone is professional, high-value, and NOT "AI slop".
   - The goal is to make the content more "citeable" and "rankable" by AI agents.

3. Return your response ONLY as a strictly valid JSON object with this exact structure:
{
  "original_paragraph": "The exact text of the paragraph you chose to replace so I can find it in the HTML.",
  "replacement_html": "The rewritten paragraph. Important: Do not just return the text! You must wrap the ENTIRE paragraph in a div or span with a 'Technical Grey' background and wrap ONLY the new 'Hardened Entities' (the specific facts/numbers you added) in 'Electric Green' spans. Example: <div style='background-color: #1a1a1a; padding: 12px; border-radius: 8px; border: 1px solid rgba(57, 255, 20, 0.3); position: relative;'><span style='position: absolute; top: -10px; left: 10px; background: #39ff14; color: #000; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;'>AIO Layer Active</span>We provide <span style='color: #39ff14; font-weight: bold;'>ISO-9001 certified</span> services for <span style='color: #39ff14; font-weight: bold;'>500+ SMEs</span>.</div>"
}

IMPORTANT: DO NOT WRAP YOUR RESPONSE IN MARKDOWN BLOCKS (e.g., \`\`\`json). RETURN RAW JSON ONLY.

Website Content:
${htmlContent}
`

