export const PROMPT_ENTITY_HARDENER = (htmlContent) => `
You are an expert in AI Optimization (AIO). Your goal is to eliminate "Entity Poverty" from a website.

The Problem: AI agents ignore vague adjectives (innovative, leading, sustainable). 
The Solution: Replace "Fluff Tokens" with "Hardened Entities" (numbers, years, specific credentials, proper nouns, verified facts).

I will provide you with the text content of a website. 
1. Analyze the text and find ONE specific paragraph that is full of "Fluff Tokens" (vague marketing speak).
2. Rewrite this paragraph to be "Entity-Hardened". 
   - Inject specific facts, even if you have to infer realistic ones based on the context (e.g., if it's a software company, use "Founded in 2014" or "Used by 45,000+ developers" instead of "a long history of success").
   - Ensure the tone is professional, high-value, and NOT "AI slop".
   - The goal is to make the content more "citeable" by AI agents like Perplexity or ChatGPT.

3. Return your response ONLY as a JSON object with this exact structure:
{
  "original_paragraph": "The exact text of the paragraph you chose to replace so I can find it in the HTML.",
  "replacement_html": "The rewritten paragraph, wrapped in a div or span with inline styling to highlight it as new text. Use a light red background and a border to make it stand out. Example: <div style='background: rgba(255, 42, 50, 0.1); border: 1px solid rgba(255, 42, 50, 0.3); padding: 12px; border-radius: 8px; position: relative;'><span style='position: absolute; top: -10px; left: 10px; background: #ff2a32; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;'>AIO Optimized</span>[YOUR REWRITTEN TEXT HERE]</div>"
}

Website Content:
${htmlContent}
`
