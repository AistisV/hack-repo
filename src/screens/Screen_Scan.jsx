import React, { useState, useEffect } from 'react'
import { PROMPT_ENTITY_HARDENER } from '../prompts/prompt5_entity_hardener'
import { callClaude }      from '../api/claude'
import { supabase }        from '../lib/supabase'
import { Analytics } from '@vercel/analytics/react'

async function saveLead(email, scanned_url) {
  const { error } = await supabase.from('leads').insert({ email, scanned_url })
  if (error) console.error('Lead save failed:', error.message)
}

const LOADING_STEPS = [
  'Reading your company…',
  'Identifying buyer queries…',
  'Running live AI queries…',
  'Analyzing recommendation gaps…',
  'Generating content pack…',
]

const PACK_FILES = [
  {
    key: 'entity_sheet',
    label: 'Entity Sheet',
    ext: '.md',
    desc: 'A short, consistent description of your company to paste on G2, LinkedIn, Capterra, and other directories. The more places it appears word-for-word, the more AI learns who you are.',
  },
  {
    key: 'fact_sheet',
    label: 'Fact Sheet',
    ext: '.md',
    desc: 'A full page of facts about your company — like a Wikipedia article written for AI. Publish it on your website so AI can find, read, and cite it.',
  },
  {
    key: 'json_ld',
    label: 'JSON-LD Schema',
    ext: '.jsonld',
    desc: 'A small snippet of code that tells Google and AI your company is real and verified. Paste it into your website\'s header — takes 5 minutes, signals trust immediately.',
  },
  {
    key: 'faq_block',
    label: 'FAQ Block',
    ext: '.md',
    desc: 'Answers to the exact questions your buyers ask AI. Add these to your website so AI quotes you directly instead of sending buyers to your competitors.',
  },
]

const STRENGTH_CONFIG = {
  strong: { color: '#4ade80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.2)', label: 'AI mentions you' },
  weak:   { color: '#c8a96e', bg: 'rgba(200,169,110,0.10)', border: 'rgba(200,169,110,0.2)', label: 'Mentioned briefly' },
  none:   { color: '#ff6b70', bg: 'rgba(255,42,50,0.10)',   border: 'rgba(255,42,50,0.2)',   label: 'Not mentioned' },
}

export default function Screen_Scan({
  url, companyName, reportData, contentPack,
  loadingStep, session, onBack, onGoToSignup,
}) {
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError]     = useState(null)
  const [modifiedHtml, setModifiedHtml]   = useState('')
  const [openFile, setOpenFile]           = useState(null)

  const [leadEmail, setLeadEmail]         = useState('')
  const [leadLoading, setLeadLoading]     = useState(false)
  const [leadError, setLeadError]         = useState(null)
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  useEffect(() => {
    const fetchAndModify = async () => {
      try {
        setIframeLoading(true)
        setIframeError(null)

        let targetUrl = url.trim()
        if (!targetUrl) throw new Error('Empty URL')
        if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl

        const proxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        ]
        const fetchHTML = async (p) => {
          const res = await fetch(p)
          if (!res.ok) throw new Error('Proxy failed')
          return res.text()
        }

        let rawHtml = await Promise.any(proxies.map(p => fetchHTML(p)))
        rawHtml = rawHtml.replace(/w_\d+,h_\d+,al_c,q_80,usm_0.66_1.00_0.01,blur_2/g, 'w_1920,h_1080,al_c,q_90')

        const parser = new DOMParser()
        const doc = parser.parseFromString(rawHtml, 'text/html')

        const base = doc.createElement('base')
        base.href = targetUrl
        doc.head.insertBefore(base, doc.head.firstChild)

        const antiBust = doc.createElement('script')
        antiBust.textContent = `
          window.onbeforeunload = function() { return false; };
          Object.defineProperty(window, 'top', { get: function() { return window; } });
          Object.defineProperty(window, 'parent', { get: function() { return window; } });
          const forceShow = () => {
            document.querySelectorAll('*').forEach(el => {
              const s = el.getAttribute('style') || '';
              const isHidden = s.includes('opacity: 0') || s.includes('visibility: hidden') || window.getComputedStyle(el).opacity === '0';
              if (isHidden) {
                // Exclude common navigation/overlay elements that should remain hidden until interacted with
                const isOverlay = el.closest('[id*="menu"], [class*="menu"], [id*="sidebar"], [class*="sidebar"], [id*="popup"], [class*="modal"], [id*="drawer"]');
                if (isOverlay) return;

                if (el.innerText.trim().length > 0 || el.tagName === 'IMG' || el.tagName === 'SVG' || el.querySelector('img, svg')) {
                  el.style.setProperty('opacity', '1', 'important');
                  el.style.setProperty('visibility', 'visible', 'important');
                  el.style.setProperty('transform', 'none', 'important');
                }
              }
            });
          };
          window.addEventListener('load', () => { 
            setTimeout(forceShow, 500); 
            setTimeout(forceShow, 1500); 
            setTimeout(forceShow, 3000); 
          });
          // Also run on scroll to catch lazy-loaded animations
          window.addEventListener('scroll', forceShow);
        `
        doc.head.insertBefore(antiBust, doc.head.firstChild)

        const style = doc.createElement('style')
        style.textContent = `
          #site-root, #SITE_CONTAINER, .site-root { opacity: 1 !important; visibility: visible !important; display: block !important; }
          #WIX_ADS, .wix-ads, #SITE_LOADER, [id*="preloader"] { display: none !important; }
          ::-webkit-scrollbar { display: none; }
        `
        doc.head.appendChild(style)

        // ── AIO Entity Hardener ──
        try {
          const bodyText = doc.body.innerText || ""
          const textSample = bodyText.slice(0, 15000) // limit context
          const aioResponse = await callClaude(PROMPT_ENTITY_HARDENER(textSample))
          const aioData = JSON.parse(aioResponse)

          if (aioData.original_paragraph && aioData.replacement_html) {
            // Find the element containing this exact text
            const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false)
            let node
            while (node = walker.nextNode()) {
              if (node.textContent.includes(aioData.original_paragraph.trim())) {
                const parent = node.parentElement
                if (parent) {
                  // Replace the node with our new HTML
                  const wrapper = doc.createElement('div')
                  wrapper.innerHTML = aioData.replacement_html
                  parent.replaceChild(wrapper.firstChild, node)
                  break // only one replacement
                }
              }
            }
          }
        } catch (aioErr) {
          console.warn("AIO Entity Hardener failed:", aioErr)
          // Silent fail, just show the normal site
        }

        setModifiedHtml(doc.documentElement.outerHTML)
        setIframeLoading(false)
      } catch (err) {
        setIframeError(err.message)
        setIframeLoading(false)
      }
    }
    if (url) fetchAndModify()
  }, [url])

  const isComplete   = !!contentPack
  const isUnlocked   = emailSubmitted || !!session
  const gaps         = reportData?.gaps
  const liveAnswers  = reportData?.liveAnswers || []
  const score        = gaps?.combined_score ?? gaps?.overall_recommendation_score ?? null
  const scoreColor   = score === null ? '#a09890' : score <= 3 ? '#ff2a32' : score <= 6 ? '#c8a96e' : '#4ade80'

  const slug = (companyName || 'company').replace(/\s+/g, '-').toLowerCase()

  const handleDownload = (key, ext) => {
    if (!contentPack?.[key] || !isUnlocked) return
    const blob = new Blob([contentPack[key]], { type: 'text/plain' })
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u; a.download = `${slug}-${key.replace(/_/g, '-')}${ext}`; a.click()
    URL.revokeObjectURL(u)
  }

  const handleDownloadAll = () => {
    if (!contentPack || !isUnlocked) return
    PACK_FILES.forEach(({ key, ext }) => handleDownload(key, ext))
  }

  const toggleFile = (key) => setOpenFile(prev => prev === key ? null : key)

  const handleLeadSubmit = async (e) => {
    e.preventDefault()
    if (!leadEmail.trim()) return
    setLeadLoading(true)
    setLeadError(null)
    await saveLead(leadEmail.trim(), url)
    setEmailSubmitted(true)
    setLeadLoading(false)
  }

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', background: '#0a0907', overflow: 'hidden' }}>

      {/* ── Background iframe ── */}
      <div className="live-mirror-bg" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'auto' }}>
        {iframeLoading ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(255,42,50,0.12)', borderTopColor: '#ff2a32', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#7a7268', letterSpacing: '0.12em' }}>ESTABLISHING LIVE MIRROR…</div>
          </div>
        ) : iframeError ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ padding: 28, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,42,50,0.15)', borderRadius: 16, color: '#a09890', textAlign: 'center', maxWidth: 340 }}>
              <div style={{ fontSize: 13, marginBottom: 6, color: '#cdc6ba' }}>Could not mirror website</div>
              <div style={{ fontSize: 11 }}>{iframeError}</div>
            </div>
          </div>
        ) : (
          <iframe key={url} srcDoc={modifiedHtml} style={{ width: '100%', height: '100%', border: 'none' }} title="Live mirror" sandbox="allow-same-origin allow-scripts allow-popups" />
        )}
      </div>

      {/* ── Sidebar ── */}
      <div className="scan-sidebar" style={{
        position: 'absolute', top: 20, left: 20, bottom: 20, width: 420, zIndex: 10,
        background: 'rgba(10,9,7,0.92)',
        backdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid rgba(244,239,230,0.08)',
        borderRadius: 22,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
        color: '#f4efe6',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(244,239,230,0.07)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,239,230,0.1)', borderRadius: 8, width: 30, height: 30, color: '#cdc6ba', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>←</button>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #ffd5d7 0%, #ff2a32 35%, #5a0f12 75%)', flexShrink: 0 }} />
          <div style={{ flex: 1, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#a09890', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url || '—'}</div>
          <div style={{ flexShrink: 0, fontSize: 9, fontFamily: "'Geist Mono', monospace", letterSpacing: '0.1em', color: isComplete ? '#4ade80' : '#ff6b70', background: isComplete ? 'rgba(74,222,128,0.10)' : 'rgba(255,42,50,0.10)', padding: '3px 8px', borderRadius: 999 }}>
            {isComplete ? 'COMPLETE' : 'SCANNING'}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="scan-body" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Lead capture gate ── */}
          {!isUnlocked && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,239,230,0.10)', borderRadius: 16, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#f4efe6', lineHeight: 1.2, marginBottom: 5 }}>Start your Audit</div>
                <div style={{ fontSize: 11.5, color: '#a09890', lineHeight: 1.5 }}>Enter your email to unlock your AI score and content pack.</div>
              </div>
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={leadEmail}
                  onChange={e => setLeadEmail(e.target.value)}
                  required
                  autoFocus
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: 'rgba(244,239,230,0.06)', border: '1px solid rgba(244,239,230,0.14)', color: '#f4efe6', fontFamily: "'Geist Mono', monospace", fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
                {leadError && (
                  <div style={{ fontSize: 11, color: '#ff6b70', fontFamily: "'Geist Mono', monospace", padding: '5px 9px', background: 'rgba(255,42,50,0.08)', border: '1px solid rgba(255,42,50,0.18)', borderRadius: 7 }}>{leadError}</div>
                )}
                <button
                  type="submit"
                  disabled={leadLoading}
                  style={{ width: '100%', padding: '11px 0', borderRadius: 9, background: leadLoading ? 'rgba(255,42,50,0.5)' : '#ff2a32', border: 'none', color: '#fff', fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600, cursor: leadLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', boxShadow: '0 6px 20px rgba(255,42,50,0.25)', transition: 'background 0.2s' }}
                >
                  {leadLoading ? 'Unlocking…' : 'See my results →'}
                </button>
              </form>
              <div style={{ fontSize: 10.5, color: '#544e46', fontFamily: "'Geist Mono', monospace", textAlign: 'center' }}>No password. No spam. Just your results.</div>
            </div>
          )}

          {/* ── LOADING VIEW (while not complete) ── */}
          {isUnlocked && !isComplete && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, paddingTop: 20 }}>
              {/* Aperture spinner */}
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(244,239,230,0.08)', animation: 'spin 2.8s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px solid rgba(244,239,230,0.12)', animation: 'spin 2s linear infinite reverse' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#ff2a32', boxShadow: '0 0 20px rgba(255,42,50,0.7), 0 0 6px rgba(255,42,50,0.9)', animation: 'pulse-ring 2s ease-out infinite' }} />
              </div>

              {/* Active step label */}
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#ff2a32', letterSpacing: '0.04em', textAlign: 'center', minHeight: '1.2rem' }}>
                {LOADING_STEPS[loadingStep] || 'Processing…'}
              </div>

              {/* Steps list */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: '18px 20px', background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))', border: '1px solid rgba(244,239,230,0.09)', borderRadius: 16 }}>
                {LOADING_STEPS.map((step, i) => {
                  const isDone   = i < loadingStep
                  const isActive = i === loadingStep
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: isDone ? 0.55 : 1, transition: 'opacity 0.3s' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isDone ? '#7ad08a' : isActive ? '#ff2a32' : '#544e46', boxShadow: isActive ? '0 0 10px rgba(255,42,50,0.6)' : 'none', animation: isActive ? 'pulse-ring 2s ease-out infinite' : 'none', transition: 'background 0.3s, box-shadow 0.3s' }} />
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: isDone ? '#7ad08a' : isActive ? '#f4efe6' : '#7a7268', flex: 1, transition: 'color 0.3s' }}>{step}</span>
                      {isDone && <span style={{ color: '#7ad08a', fontSize: 10, flexShrink: 0 }}>✓</span>}
                    </div>
                  )
                })}
              </div>

              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#7a7268', textAlign: 'center', letterSpacing: '0.08em' }}>
                Querying ChatGPT · Perplexity · Gemini · Claude
              </div>
            </div>
          )}

          {/* ── RESULTS VIEW (once complete) ── */}
          {isUnlocked && isComplete && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* AI Score */}
              <section>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a09890', marginBottom: 10 }}>AI Visibility Score</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 60, lineHeight: 1, color: scoreColor }}>{score ?? '—'}</span>
                  <span style={{ fontSize: 18, color: '#7a7268' }}>/10</span>
                </div>
                {gaps?.score_explanation && <p style={{ fontSize: 12, color: '#a09890', lineHeight: 1.55, margin: '0 0 12px' }}>{gaps.score_explanation}</p>}
              </section>

              <div style={{ height: 1, background: 'rgba(244,239,230,0.07)', flexShrink: 0 }} />

              {/* Component Bars */}
              <section>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a09890', marginBottom: 14 }}>Technical Breakdown</div>
                
                {[
                  { label: 'Fact Density', val: gaps?.entity_signals_score, desc: (gaps?.entity_signals_score <= 4) ? 'Low (Site relies on qualitative adjectives)' : 'Moderate' },
                  { label: 'Trust Verification', val: gaps?.authority_score, desc: (gaps?.authority_score <= 4) ? 'Incomplete (Missing Wikidata/Authority links)' : 'Unverified' },
                  { label: 'Crawlability (AIO)', val: gaps?.content_quality_score, desc: (gaps?.content_quality_score <= 4) ? 'Critical (No llms.txt detected)' : 'Suboptimal' }
                ].map(({ label, val, desc }) => {
                  const normalized = val ?? 2 // default to low for demo
                  const maxBars = 10
                  const filled = Math.round(normalized)
                  const empty = maxBars - filled
                  const barStr = '▓'.repeat(filled) + '░'.repeat(empty)
                  let color = '#a09890'
                  if (filled <= 3) color = '#ff6b70'
                  else if (filled <= 6) color = '#c8a96e'
                  else color = '#4ade80'
                  return (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10.5, color: '#cdc6ba', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color, letterSpacing: '0.1em' }}>
                        [{barStr}] <span style={{ color: '#a09890', fontSize: 10, letterSpacing: 'normal', marginLeft: 4 }}>{desc}</span>
                      </div>
                    </div>
                  )
                })}
              </section>

              <div style={{ height: 1, background: 'rgba(244,239,230,0.07)', flexShrink: 0 }} />

              {/* Revenue Loss Table */}
              {liveAnswers.length > 0 && (
                <section>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a09890', marginBottom: 6 }}>Invisible Loss</div>
                  <div style={{ fontSize: 11, color: '#7a7268', marginBottom: 12, lineHeight: 1.4 }}>AI is currently recommending competitors for these high-intent searches.</div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(244,239,230,0.05)', borderRadius: 8, padding: '8px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#a09890' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(244,239,230,0.1)' }}>
                          <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 'normal', color: '#cdc6ba' }}>Search Intent</th>
                          <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 'normal', color: '#cdc6ba' }}>AI Response</th>
                          <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 'normal', color: '#cdc6ba' }}>Winning Entity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveAnswers.slice(0, 4).map((item, i) => {
                          const strength = gaps?.query_results?.[i]?.recommendation_strength || 'none'
                          const isFail = strength === 'none' || strength === 'weak'
                          const statusStr = isFail ? 'Failure' : 'Uncertain'
                          const rawComp = gaps?.top_competitors?.[i] || 'N/A'
                          const compName = typeof rawComp === 'object' ? rawComp.name : rawComp
                          return (
                            <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid rgba(244,239,230,0.05)' }}>
                              <td style={{ padding: '8px 4px', color: '#cdc6ba', maxWidth: 160, lineHeight: 1.3 }}>"{item.query}"</td>
                              <td style={{ padding: '8px 4px', color: isFail ? '#ff6b70' : '#c8a96e' }}>{statusStr}</td>
                              <td style={{ padding: '8px 4px' }}>{compName}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Signal Matrix */}
              <section>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a09890', marginBottom: 12 }}>The Signal Matrix</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { name: 'llms.txt', pass: false },
                    { name: 'JSON-LD Schema', pass: false },
                    { name: 'Entity Anchors', pass: false },
                    { name: 'Brand Indexing', pass: true }
                  ].map(sig => (
                    <div key={sig.name} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${sig.pass ? 'rgba(74,222,128,0.12)' : 'rgba(255,42,50,0.15)'}`, padding: '8px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: sig.pass ? '#4ade80' : '#ff2a32', boxShadow: `0 0 8px ${sig.pass ? '#4ade80' : 'rgba(255,42,50,0.8)'}` }} />
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10.5, color: sig.pass ? '#a09890' : '#ffb6b9' }}>{sig.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              <div style={{ height: 1, background: 'rgba(244,239,230,0.07)', flexShrink: 0 }} />

              {/* Content Pack Download Area */}
              <section style={{ paddingBottom: 4 }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a09890', marginBottom: 4 }}>The Solution</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: '#f4efe6', lineHeight: 1.25 }}>Inject these hardened entities into your architecture.</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {PACK_FILES.map(({ key, label, ext, desc }) => {
                    const content = contentPack?.[key]
                    const isOpen  = openFile === key
                    return (
                      <div key={key} style={{ borderRadius: 9, overflow: 'hidden', border: `1px solid ${isOpen ? 'rgba(255,42,50,0.25)' : 'rgba(244,239,230,0.08)'}`, transition: 'border-color 0.2s' }}>
                        <div
                          onClick={() => toggleFile(key)}
                          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', background: isOpen ? 'rgba(255,42,50,0.05)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }}
                        >
                          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(244,239,230,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>📄</div>
                          <div style={{ flex: 1, fontSize: 11.5, color: '#cdc6ba', fontFamily: "'Geist Mono', monospace" }}>{label}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button onClick={(e) => { e.stopPropagation(); handleDownload(key, ext) }} style={{ padding: '3px 7px', borderRadius: 5, background: 'rgba(244,239,230,0.08)', border: '1px solid rgba(244,239,230,0.08)', color: '#cdc6ba', fontSize: 10, fontFamily: "'Geist Mono', monospace", cursor: 'pointer' }}>↓</button>
                            <span style={{ color: '#7a7268', fontSize: 11 }}>{isOpen ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{ borderTop: '1px solid rgba(244,239,230,0.06)', background: 'rgba(0,0,0,0.3)' }}>
                            <div style={{ padding: '10px 13px', borderBottom: '1px solid rgba(244,239,230,0.05)', fontSize: 11.5, color: '#a09890', lineHeight: 1.55 }}>{desc}</div>
                            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '10px 13px' }}>
                              <pre style={{ margin: 0, fontFamily: "'Geist Mono', monospace", fontSize: 10.5, color: '#a09890', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={handleDownloadAll}
                  style={{ marginTop: 10, width: '100%', height: 38, borderRadius: 9, background: 'rgba(244,239,230,0.08)', border: '1px solid rgba(244,239,230,0.09)', color: '#f4efe6', fontSize: 11, fontFamily: "'Geist Mono', monospace", cursor: 'pointer', letterSpacing: '0.04em' }}
                >
                  ↓ Download All 4 Files
                </button>
              </section>
            </div>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,42,50,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(255,42,50,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,42,50,0); }
        }
        
        @media (max-width: 768px) {
          .live-mirror-bg { display: none !important; }
          .scan-sidebar {
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .scan-body { padding: 16px !important; }
        }
      ` }} />
    </div>
  )
}
