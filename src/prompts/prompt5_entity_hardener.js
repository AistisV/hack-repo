export const PROMPT_ENTITY_HARDENER = (htmlContent) => `
You are an expert in AI Optimization (AIO) and Local SEO. Your goal is to eliminate "Geo-Poverty" from a website.

The Problem: AI agents cannot recommend a business if they don't know WHERE it operates. Vague text (e.g., "serving customers nationwide") loses to specific local entities.
The Solution: Inject "GEO-Optimized Entities" (specific cities, regions, local landmarks, or localized service areas).

I will provide you with the text content of a website. 
1. Analyze the text and find ONE specific paragraph that describes their services but lacks clear geographic context.
2. Rewrite this paragraph to be "GEO-Optimized". 
   - Inject specific local details, even if you have to infer realistic ones based on the context (e.g., if it's a generic cleaning company, inject "serving the Greater Chicago Area, including Naperville and Evanston" instead of "serving our local community").
   - Ensure the tone is professional, high-value, and naturally integrated.
   - The goal is to make the content highly relevant for "Near Me" AI queries.

3. Return your response ONLY as a JSON object with this exact structure:
{
  "original_paragraph": "The exact text of the paragraph you chose to replace so I can find it in the HTML.",
  "replacement_html": "The rewritten paragraph, wrapped in a div or span with inline styling to highlight it as new text. Use a light red background and a border to make it stand out. Example: <div style='background: rgba(255, 42, 50, 0.1); border: 1px solid rgba(255, 42, 50, 0.3); padding: 12px; border-radius: 8px; position: relative;'><span style='position: absolute; top: -10px; left: 10px; background: #ff2a32; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;'>AIO Optimized</span>[YOUR REWRITTEN TEXT HERE]</div>"
}

Website Content:
${htmlContent}
`
