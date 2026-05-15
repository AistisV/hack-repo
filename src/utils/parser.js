export function parseJSON(text) {
  try {
    // Remove markdown code fences
    let clean = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Find JSON object or array
    const objStart = clean.indexOf('{')
    const arrStart = clean.indexOf('[')

    if (objStart === -1 && arrStart === -1) {
      throw new Error('No JSON found')
    }

    let start, end
    if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
      start = arrStart
      end = clean.lastIndexOf(']') + 1
    } else {
      start = objStart
      end = clean.lastIndexOf('}') + 1
    }

    const jsonStr = clean.slice(start, end)
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error('JSON parse error:', e.message)
    console.error('Raw text:', text.slice(0, 300))
    return null
  }
}

export function parseContentPack(text) {
  const extractSection = (content, fromHeader, toHeader) => {
    const fromTag = `=== ${fromHeader} ===`
    const toTag = toHeader ? `=== ${toHeader} ===` : null

    const start = content.indexOf(fromTag)
    if (start === -1) return ''

    const contentStart = start + fromTag.length
    const end = toTag ? content.indexOf(toTag, contentStart) : content.length

    return content.slice(contentStart, end === -1 ? content.length : end).trim()
  }

  return {
    entity_sheet:        extractSection(text, 'ENTITY_SHEET', 'FACT_SHEET'),
    fact_sheet:          extractSection(text, 'FACT_SHEET', 'JSON_LD'),
    json_ld:             extractSection(text, 'JSON_LD', 'FAQ_BLOCK'),
    faq_block:           extractSection(text, 'FAQ_BLOCK', null),
  }
}
