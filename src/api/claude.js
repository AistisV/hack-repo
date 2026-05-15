const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

export async function callClaude(prompt, maxTokens = 4000) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  if (!apiKey || apiKey === 'your_claude_api_key_here') {
    throw new Error('NO_API_KEY')
  }

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
  return block.text
}
