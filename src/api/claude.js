import { supabase } from '../lib/supabase'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

async function generateHash(str) {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function callClaude(prompt, maxTokens = 4000) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  if (!apiKey || apiKey === 'your_claude_api_key_here') {
    throw new Error('NO_API_KEY')
  }

  // Generate Cache Key
  const hash = await generateHash(prompt);
  const cacheKey = 'claude_' + hash;

  // 1. Check Global Cache (Supabase)
  try {
    const { data: cached, error } = await supabase
      .from('api_cache')
      .select('response_json')
      .eq('cache_key', cacheKey)
      .single();

    if (cached && !error) {
      console.log("AIO: Using GLOBAL cached Claude response");
      return cached.response_json.text;
    }
  } catch (err) {
    console.warn("AIO: Supabase cache lookup failed, falling back to API", err);
  }

  // 2. Check Local Cache Fallback
  const localCached = localStorage.getItem('nando_claude_' + hash);
  if (localCached) {
    console.log("AIO: Using local cached Claude response");
    return localCached;
  }

  // 3. Fresh API Call
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error ${response.status}: ${err}`)
  }

  const data = await response.json()

  if (data.stop_reason === 'refusal') {
    return ''
  }

  const block = data.content?.[0]
  if (!block || block.type !== 'text') {
    throw new Error(`Claude returned empty response (stop_reason: ${data.stop_reason || 'unknown'})`)
  }

  const text = block.text;

  // 4. Save to Global & Local Cache
  try {
    localStorage.setItem('nando_claude_' + hash, text);
    
    // Save to Supabase (Background-ish, don't block return)
    supabase
      .from('api_cache')
      .upsert({ cache_key: cacheKey, response_json: { text } })
      .then(({ error }) => {
        if (error) console.warn("AIO: Failed to save to global cache", error);
      });

  } catch (e) {
    console.warn("AIO: Cache update error", e);
  }

  return text
}
