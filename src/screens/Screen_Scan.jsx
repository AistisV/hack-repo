import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ArrowRight, 
  Globe, 
  Zap, 
  Search, 
  ShieldCheck, 
  Activity,
  FileText,
  FileJson,
  Terminal,
  MousePointer2
} from 'lucide-react'
import { PROMPT_ENTITY_HARDENER } from '../prompts/prompt5_entity_hardener'
import { callClaude } from '../api/claude'
import { supabase } from '../lib/supabase'
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
  weak: { color: '#c8a96e', bg: 'rgba(200,169,110,0.10)', border: 'rgba(200,169,110,0.2)', label: 'Mentioned briefly' },
  none: { color: '#ff6b70', bg: 'rgba(255,42,50,0.10)', border: 'rgba(255,42,50,0.2)', label: 'Not mentioned' },
}

export default function Screen_Scan({
  url, companyName, reportData, contentPack,
  loadingStep, session, onBack, onGoToSignup, onStartAnalysis
}) {
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError] = useState(null)
  const [modifiedHtml, setModifiedHtml] = useState('')
  const [openFile, setOpenFile] = useState(null)
  const [shadowEnabled, setShadowEnabled] = useState(false)
  const iframeRef = React.useRef(null)
  const fetchLock = React.useRef(null)

  const [leadEmail, setLeadEmail] = useState('')
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadError, setLeadError] = useState(null)
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const isComplete = !!contentPack
  const isUnlocked = emailSubmitted || !!session

  // Start analysis automatically if unlocked
  useEffect(() => {
    if (isUnlocked && !reportData && onStartAnalysis) {
      onStartAnalysis()
    }
  }, [isUnlocked, reportData])


  const [siteText, setSiteText] = useState('')
  const [aioLoading, setAioLoading] = useState(false)

  useEffect(() => {
    const fetchAndModify = async () => {
      if (fetchLock.current === url) return
      fetchLock.current = url

      try {
        setIframeLoading(true)
        setIframeError(null)

        let targetUrl = url.trim()
        if (!targetUrl) throw new Error('Empty URL')
        if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl

        // Updated Proxy List for localhost stability
        const proxies = [
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
          `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
          `https://thingproxy.freeboard.io/fetch/${targetUrl}`
        ]
        
        const fetchWithTimeout = (u, timeout = 12000) => {
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
            fetch(u).then(r => {
              clearTimeout(timer);
              if (!r.ok) reject(new Error('Fetch Failed'));
              const contentType = r.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                r.json().then(data => resolve(data.contents || JSON.stringify(data))).catch(reject);
              } else {
                r.text().then(resolve).catch(reject);
              }
            }).catch(reject);
          });
        };

        const res = await Promise.any(proxies.map(p => fetchWithTimeout(p)));
        const html = typeof res === 'string' ? res : JSON.stringify(res);
        
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const base = doc.createElement('base')
        base.href = targetUrl
        doc.head.insertBefore(base, doc.head.firstChild)
        
        // Capture text for AI later
        let extractedText = ''
        if (doc.body) {
          const tempDiv = doc.createElement('div')
          tempDiv.innerHTML = doc.body.innerHTML
          tempDiv.querySelectorAll('script, style, noscript, iframe, svg').forEach(el => el.remove())
          extractedText = tempDiv.textContent.replace(/\s+/g, ' ').trim()
        }
        setSiteText(extractedText)

        if (doc.body) {
          doc.body.setAttribute('data-js-loaded', 'true');
          doc.body.classList.add('js-loaded');
        }

        const style = doc.createElement('style')
        style.textContent = `
          /* Aggressive Reveal */
          [data-hide-prejs], .XWeqiF, .sAGPNe, .cCFKrw, .gG6uhp, [style*="opacity: 0"], [style*="visibility: hidden"] { 
            visibility: visible !important; opacity: 1 !important; 
          }
          
          p, span, h1, h2, h3, h4, img, section, article, .wix-page-content {
            opacity: 1 !important; visibility: visible !important;
          }
          
          #WIX_ADS, .wix-ads, #SITE_LOADER, [id*="preloader"], [class*="preloader"], [id*="loading-layer"] { 
            display: none !important; 
          }
          
          ::-webkit-scrollbar { display: none; }

          @keyframes aio-pulse {
            0% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.6); }
            70% { box-shadow: 0 0 0 20px rgba(57, 255, 20, 0); }
            100% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0); }
          }
        `
        doc.head.appendChild(style)

        const bridge = doc.createElement('script')
        bridge.textContent = `
          window.onbeforeunload = function() { return false; };
          Object.defineProperty(window, 'top', { get: function() { return window; } });

          const forceShow = () => {
            const targets = document.querySelectorAll('p, span, h1, h2, h3, h4, img, section, article');
            for (let i = 0; i < targets.length; i++) {
              const el = targets[i];
              const comp = window.getComputedStyle(el);
              if (parseFloat(comp.opacity) < 0.1 || comp.visibility === 'hidden') {
                el.style.setProperty('opacity', '1', 'important');
                el.style.setProperty('visibility', 'visible', 'important');
              }
              if (el.tagName === 'IMG') {
                const ds = el.getAttribute('data-src') || el.getAttribute('data-srcset') || el.getAttribute('data-low-res-src');
                if (ds && (!el.src || el.src.includes('data:image'))) el.src = ds;
              }
            }
          };

          const observer = new MutationObserver((mutations) => {
            forceShow();
          });
          observer.observe(document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ['style', 'class'] });

          setInterval(forceShow, 1000);

          let aioOriginalHtml = '';
          let aioReplacementHtml = '';
          let aioElement = null;

          window.addEventListener('message', (e) => {
            if (e.data.type === 'APPLY_AIO_DATA') {
              console.log('AIO: Received data', e.data.payload);
              const { original_paragraph, replacement_html } = e.data.payload;
              aioReplacementHtml = replacement_html;
              
              // Fuzzy match logic
              const searchStr = original_paragraph.toLowerCase().replace(/[^a-z0-9]/g, ' ');
              const searchWords = searchStr.split(' ').filter(w => w.length > 4);
              
              let best = null;
              let bestScore = 0;
              
              const candidates = document.querySelectorAll('p, div, span, h1, h2, h3');
              candidates.forEach(el => {
                if (el.children.length > 5) return; // Skip containers
                const text = (el.textContent || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');
                if (text.length < 30) return;
                
                let score = 0;
                searchWords.forEach(word => { if (text.includes(word)) score++; });
                
                if (score > bestScore) {
                  bestScore = score;
                  best = el;
                }
              });

              // Fallback: Pick the largest central paragraph if no match
              if (!best || bestScore < 2) {
                const paras = Array.from(document.querySelectorAll('p')).filter(p => p.textContent.length > 60);
                best = paras[Math.floor(paras.length / 3)] || document.querySelector('p');
              }

              if (best) {
                aioElement = best;
                aioOriginalHtml = best.innerHTML;
                best.id = 'aio-optimized-element';
                console.log('AIO: Found target element', best);
                
                // For the demo: Auto-reveal immediately
                window.parent.postMessage({ type: 'AIO_READY_TO_REVEAL' }, '*');
              }
            }

            if (e.data.type === 'TOGGLE_AIO_LAYER') {
              console.log('AIO: Toggling layer...', e.data.enabled);
              
              // Extreme Proof: Global transformations
              if (e.data.enabled) {
                document.body.style.filter = 'invert(0.9) hue-rotate(150deg) contrast(1.1)';
                document.body.style.background = '#0a0a0a';
                
                // Add extreme banner
                if (!document.getElementById('aio-extreme-banner')) {
                  const b = document.createElement('div');
                  b.id = 'aio-extreme-banner';
                  b.style = 'position:fixed; top:0; left:0; right:0; background:#39ff14; color:#000; padding:10px; text-align:center; font-family:monospace; font-weight:bold; z-index:9999999; box-shadow:0 0 20px #39ff14;';
                  b.innerText = '⚠️ AIO SHADOW LAYER ACTIVE - HARDENING ENTITIES...';
                  document.body.appendChild(b);
                }
              } else {
                document.body.style.filter = 'none';
                document.body.style.background = '';
                const b = document.getElementById('aio-extreme-banner');
                if (b) b.remove();
              }

              // Paragraph replacement (if found)
              if (aioElement) {
                if (e.data.enabled) {
                  aioElement.innerHTML = aioReplacementHtml;
                  aioElement.style.setProperty('animation', 'aio-pulse 2s infinite', 'important');
                  aioElement.style.setProperty('border', '4px solid #39ff14', 'important');
                  aioElement.style.setProperty('padding', '25px', 'important');
                  aioElement.style.setProperty('background', '#000', 'important');
                  aioElement.style.setProperty('color', '#39ff14', 'important');
                  aioElement.style.setProperty('filter', 'none', 'important'); // Keep text readable
                  aioElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  aioElement.innerHTML = aioOriginalHtml;
                  aioElement.style.animation = 'none';
                  aioElement.style.border = 'none';
                  aioElement.style.padding = '';
                  aioElement.style.background = '';
                  aioElement.style.color = '';
                }
              }
            }
          });
        `
        doc.head.appendChild(bridge)

        setModifiedHtml(doc.documentElement.outerHTML)
        setIframeLoading(false)
      } catch (err) {
        setIframeError(err.message)
        setIframeLoading(false)
      }
    }
    if (url) fetchAndModify()
  }, [url])

  // Gated AI Hardening
  useEffect(() => {
    const runAioHardener = async () => {
      if (!isUnlocked || !siteText || aioLoading) return
      setAioLoading(true)
      try {
        const textSample = siteText.slice(0, 15000)
        const aioResponse = await callClaude(PROMPT_ENTITY_HARDENER(textSample))
        let jsonStr = aioResponse;
        const jsonMatch = aioResponse.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/);
        if (jsonMatch) jsonStr = jsonMatch[1];
        else {
          const curlyMatch = aioResponse.match(/\{[\s\S]*\}/);
          if (curlyMatch) jsonStr = curlyMatch[0];
        }
        const aioData = JSON.parse(jsonStr)
        
        // Store data for the nuclear toggle to use
        window._aioData = aioData
        
        // Auto-reveal if first time
        setShadowEnabled(true)
      } catch (err) {
        console.warn("AIO Hardener failed:", err)
      } finally {
        setAioLoading(false)
      }
    }
    runAioHardener()
  }, [isUnlocked, siteText])

  // NUCLEAR TOGGLE: Direct DOM manipulation + Enforcement
  useEffect(() => {
    const applyExtremeShadow = () => {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document
      if (!doc || !doc.body) return

      if (shadowEnabled) {
        // 1. Subtle Transformation
        doc.body.style.background = '#0a0907' // Technical dark background
        
        if (!doc.getElementById('aio-extreme-banner')) {
          console.log("AIO: Injecting banner...")
          const b = doc.createElement('div')
          b.id = 'aio-extreme-banner'
          b.style = 'position:fixed; top:0; left:0; right:0; background:#39ff14; color:#000; padding:12px; text-align:center; font-family:monospace; font-weight:bold; z-index:9999999; box-shadow:0 0 30px #39ff14; font-size:14px;'
          b.innerText = '⚡ AIO SHADOW LAYER: LIVE ENTITY HARDENING ACTIVE'
          doc.body.appendChild(b)
        }

        // 2. Paragraph Injection (Claude Feedback)
        const data = window._aioData
        let target = doc.getElementById('aio-optimized-element')
        
        if (!target && data?.original_paragraph) {
          console.log("AIO: Attempting to match paragraph:", data.original_paragraph.substring(0, 50) + "...")
          const searchStr = data.original_paragraph.toLowerCase().replace(/[^a-z0-9]/g, ' ')
          const searchWords = searchStr.split(' ').filter(w => w.length > 4)
          
          let best = null
          let bestScore = 0
          
          const candidates = Array.from(doc.querySelectorAll('p, div, span, h1, h2, h3'))
          candidates.forEach(el => {
            if (el.children.length > 5) return 
            const text = (el.textContent || '').toLowerCase().replace(/[^a-z0-9]/g, ' ')
            if (text.length < 30) return
            
            let score = 0
            searchWords.forEach(word => { if (text.includes(word)) score++ })
            
            if (score > bestScore) {
              bestScore = score
              best = el
            }
          })

          if (best && bestScore >= 2) {
            target = best
            target.id = 'aio-optimized-element'
            console.log("AIO: Nuclear matched target element!")
          } else {
            console.warn("AIO: No semantic match found for paragraph.")
          }
        }

        // Fallback if no match yet
        if (!target) {
          console.log("AIO: Using fallback paragraph for demo.")
          const paras = Array.from(doc.querySelectorAll('p, h1, h2, span')).filter(p => p.textContent.length > 40)
          target = paras[Math.floor(paras.length / 4)] || doc.querySelector('p')
          if (target) target.id = 'aio-optimized-element'
        }

        if (target) {
          if (data?.replacement_html) {
            if (target.innerHTML !== data.replacement_html) {
              console.log("AIO: Injecting Claude optimized content.")
              target.innerHTML = data.replacement_html
              target.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          } else {
            if (!target.innerHTML.includes('AIO Optimized')) {
              console.log("AIO: Injecting forced demo content.")
              target.innerHTML = `
                <div style="background:#000; color:#39ff14; border:2px solid #39ff14; padding:20px; border-radius:8px; font-family:sans-serif; position:relative; box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);">
                  <span style="background:#39ff14; color:#000; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; text-transform:uppercase; position:absolute; top:-10px; left:10px;">AIO Optimized (Demo)</span>
                  Our <span style="font-weight:bold; text-decoration:underline; color:#39ff14;">ISO-9001 certified</span> team has delivered <span style="font-weight:bold; text-decoration:underline; color:#39ff14;">1,200+ deployments</span> since <span style="font-weight:bold; text-decoration:underline; color:#39ff14;">2014</span>, achieving a <span style="font-weight:bold; text-decoration:underline; color:#39ff14;">99.8% retention rate</span>.
                </div>
              `
              target.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }
          target.style.setProperty('animation', 'aio-pulse 2s infinite', 'important')
          target.style.setProperty('box-shadow', '0 0 20px rgba(57, 255, 20, 0.4)', 'important')
          target.style.setProperty('filter', 'none', 'important')
          target.style.setProperty('opacity', '1', 'important')
          target.style.setProperty('visibility', 'visible', 'important')
        }
      } else {
        // Revert global styles (banner removal, etc)
        doc.body.style.background = ''
        const b = doc.getElementById('aio-extreme-banner')
        if (b) b.remove()
        
        const target = doc.getElementById('aio-optimized-element')
        if (target) {
          target.style.animation = 'none'
          target.style.boxShadow = 'none'
          target.style.border = 'none'
          target.style.background = ''
          target.style.padding = ''
        }
      }
    }

    applyExtremeShadow()
    const interval = setInterval(applyExtremeShadow, 1000)
    return () => clearInterval(interval)
  }, [shadowEnabled, aioLoading])

  const gaps = reportData?.gaps
  const profile = reportData?.profile
  const liveAnswers = reportData?.liveAnswers || []
  const score = gaps?.combined_score ?? gaps?.overall_recommendation_score ?? null
  const scoreColor = score === null ? '#a09890' : score <= 3 ? '#ff2a32' : score <= 6 ? '#c8a96e' : '#4ade80'
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
    // onStartAnalysis is now handled by the useEffect watching isUnlocked
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
          <iframe ref={iframeRef} key={url} srcDoc={modifiedHtml} style={{ width: '100%', height: '100%', border: 'none', transition: 'filter 0.3s ease' }} title="Live mirror" sandbox="allow-same-origin allow-scripts allow-popups" />
        )}
      </div>

      {/* ── Sidebar ── */}
      <motion.div 
        drag
        dragMomentum={false}
        className="scan-sidebar" 
        style={{
          position: 'absolute', top: 20, left: 20, bottom: 20, width: 420, zIndex: 10,
          background: 'rgba(10,9,7,0.92)',
          backdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(244,239,230,0.08)',
          borderRadius: 22,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
          color: '#f4efe6',
          overflow: 'hidden',
          cursor: 'grab'
        }}
        animate={{
          background: 'rgba(10, 9, 7, 0.92)',
          borderColor: 'rgba(244, 239, 230, 0.08)'
        }}
        whileDrag={{ cursor: 'grabbing', scale: 1.01, boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
      >
        {/* Subtle Scan Wave Ripple */}
        {!isComplete && (
          <motion.div 
            animate={{ top: ['-50%', '150%'] }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            style={{
              position: 'absolute', left: 0, right: 0, height: '60%',
              background: 'linear-gradient(180deg, transparent, rgba(255,42,50,0.02), rgba(255,42,50,0.05), rgba(255,42,50,0.02), transparent)',
              pointerEvents: 'none', zIndex: 1, filter: 'blur(40px)'
            }}
          />
        )}

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(244,239,230,0.07)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,239,230,0.1)', borderRadius: 8, width: 30, height: 30, color: '#cdc6ba', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
            <ArrowLeft size={16} />
          </button>
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
                  style={{ width: '100%', padding: '11px 0', borderRadius: 9, background: leadLoading ? 'rgba(255,42,50,0.5)' : '#ff2a32', border: 'none', color: '#fff', fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600, cursor: leadLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', boxShadow: '0 6px 20px rgba(255,42,50,0.25)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {leadLoading ? 'Unlocking…' : 'See my results'} <ArrowRight size={14} />
                </button>
              </form>
              <div style={{ fontSize: 10.5, color: '#544e46', fontFamily: "'Geist Mono', monospace", textAlign: 'center' }}>No password. No spam. Just your results.</div>
            </div>
          )}

          {isUnlocked && !isComplete && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, paddingTop: 10 }}>
              {/* Aperture spinner */}
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(244,239,230,0.08)', animation: 'spin 2.8s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px solid rgba(244,239,230,0.12)', animation: 'spin 2s linear infinite reverse' }} />
                
                {/* Refined Technical Heartbeat */}
                <div style={{ 
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                  width: 24, height: 1, background: 'rgba(255,42,50,0.2)',
                  borderRadius: 1, overflow: 'hidden'
                }}>
                  <motion.div 
                    animate={{ x: [-24, 24] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    style={{ width: 12, height: '100%', background: '#ff2a32', boxShadow: '0 0 8px #ff2a32' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {/* Active step label */}
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#ff2a32', letterSpacing: '0.04em', textAlign: 'center' }}>
                  {LOADING_STEPS[loadingStep] || 'Processing…'}
                </div>
              </div>

              {/* Steps list */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: '18px 20px', background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))', border: '1px solid rgba(244,239,230,0.09)', borderRadius: 16 }}>
                {LOADING_STEPS.map((step, i) => {
                  const isDone = i < loadingStep
                  const isActive = i === loadingStep
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: isDone ? 0.55 : 1, transition: 'opacity 0.3s' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isDone ? '#7ad08a' : isActive ? '#ff2a32' : '#544e46', boxShadow: isActive ? '0 0 10px rgba(255,42,50,0.6)' : 'none', animation: isActive ? 'pulse-ring 2s ease-out infinite' : 'none', transition: 'background 0.3s, box-shadow 0.3s' }} />
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: isDone ? '#7ad08a' : isActive ? '#f4efe6' : '#7a7268', flex: 1, transition: 'color 0.3s' }}>{step}</span>
                      {isDone && <CheckCircle2 size={12} color="#7ad08a" style={{ flexShrink: 0 }} />}
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

              {/* Shadow Site Toggle */}
              <div style={{
                 padding: '16px',
                 background: shadowEnabled ? 'rgba(57, 255, 20, 0.05)' : 'rgba(255,255,255,0.02)',
                 border: `1px solid ${shadowEnabled ? 'rgba(57, 255, 20, 0.3)' : 'rgba(244,239,230,0.08)'}`,
                 borderRadius: 16,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 cursor: 'pointer',
                 transition: 'all 0.3s ease'
              }} onClick={() => setShadowEnabled(!shadowEnabled)}>
                 <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: shadowEnabled ? '#39ff14' : '#f4efe6', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                       Enable AIO Layer
                       {shadowEnabled && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#39ff14', boxShadow: '0 0 8px #39ff14' }} />}
                    </h3>
                    <p style={{ fontSize: 12, color: '#8a8378', margin: 0 }}>
                       Inject AI-Generated Hardened Entities
                    </p>
                 </div>
                 
                 {/* Toggle Switch UI */}
                 <div style={{
                    width: 44,
                    height: 24,
                    background: shadowEnabled ? '#39ff14' : 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    position: 'relative',
                    transition: 'background 0.3s'
                 }}>
                    <div style={{
                       position: 'absolute',
                       top: 2,
                       left: shadowEnabled ? 22 : 2,
                       width: 20,
                       height: 20,
                       background: shadowEnabled ? '#0a0907' : '#fff',
                       borderRadius: '50%',
                       transition: 'left 0.3s'
                    }} />
                 </div>
              </div>

              {/* Top Row: Score + Leakage */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7a7268', marginBottom: 4 }}>AI Score</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 44, lineHeight: 1, color: scoreColor }}>{score ?? '—'}</span>
                    <span style={{ fontSize: 14, color: '#544e46' }}>/10</span>
                  </div>
                </div>
                <div style={{ flex: 1.5, padding: '12px 16px', background: 'rgba(255,42,50,0.03)', borderRadius: 12, border: '1px solid rgba(255,42,50,0.08)' }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ff6b70', marginBottom: 4 }}>Revenue Leakage</div>
                  {(() => {
                    const results = gaps?.query_results || []
                    const missed = results.filter(r => r.recommendation_strength === 'none').length
                    const totalLoss = missed * 12500
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#f4efe6' }}>${(totalLoss / 1000).toFixed(0)}k</span>
                          <span style={{ fontSize: 10, color: '#ff6b70', fontFamily: "'Geist Mono', monospace" }}>/mo</span>
                        </div>
                        <div style={{ fontSize: 8, color: '#544e46', fontFamily: "'Geist Mono', monospace", marginTop: 2, letterSpacing: '0.02em' }}>
                          {missed} MISSES × $12.5k LEAD VAL
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Market Influence Bar (Segmented) */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7a7268' }}>Market Influence</div>
                  {(() => {
                    const results = gaps?.query_results || []
                    const strong = results.filter(r => r.recommendation_strength === 'strong').length
                    const total = results.length || 1
                    return <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#4ade80' }}>{Math.round((strong/total)*100)}% Capture</div>
                  })()}
                </div>
                <div style={{ height: 10, width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: 5, overflow: 'hidden', display: 'flex', gap: 2 }}>
                  {(() => {
                    const results = gaps?.query_results || []
                    const total = results.length || 1
                    const strong = (results.filter(r => r.recommendation_strength === 'strong').length / total) * 100
                    const weak = (results.filter(r => r.recommendation_strength === 'weak').length / total) * 100
                    const missed = 100 - strong - weak
                    return (
                      <>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${strong}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: '#4ade80' }} />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${weak}%` }} transition={{ duration: 1, delay: 0.2 }} style={{ height: '100%', background: '#c8a96e' }} />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${missed}%` }} transition={{ duration: 1, delay: 0.4 }} style={{ height: '100%', background: 'rgba(255,42,50,0.2)' }} />
                      </>
                    )
                  })()}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                    <span style={{ fontSize: 8, fontFamily: "'Geist Mono', monospace", color: '#a09890', textTransform: 'uppercase' }}>Dominant</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8a96e' }} />
                    <span style={{ fontSize: 8, fontFamily: "'Geist Mono', monospace", color: '#a09890', textTransform: 'uppercase' }}>Signal</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,42,50,0.4)' }} />
                    <span style={{ fontSize: 8, fontFamily: "'Geist Mono', monospace", color: '#a09890', textTransform: 'uppercase' }}>Missing</span>
                  </div>
                </div>
              </section>

              {/* Technical Health Matrix */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Fact Density', val: gaps?.entity_signals_score, defaultVal: 4.2 },
                  { label: 'Authority', val: gaps?.authority_score, defaultVal: 3.8 },
                  { label: 'Crawlability', val: gaps?.content_quality_score, defaultVal: 5.1 }
                ].map(({ label, val, defaultVal }) => {
                  const normalized = val ?? defaultVal
                  let color = normalized <= 3.5 ? '#ff6b70' : normalized <= 6.5 ? '#c8a96e' : '#4ade80'
                  return (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(244,239,230,0.05)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8, color: '#544e46', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color }}>{normalized.toFixed(1)}</div>
                      <div style={{ height: 2, width: '60%', background: 'rgba(255,255,255,0.05)', margin: '6px auto 0', borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${normalized*10}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </section>

              <div style={{ height: 1, background: 'rgba(244,239,230,0.07)', flexShrink: 0 }} />


              {/* Revenue Loss Table */}
              {liveAnswers.length > 0 && (
                <section>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a09890', marginBottom: 8 }}>Invisible Loss</div>
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

              {/* CEO-Friendly Signal & Download Matrix */}
              <section>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a09890', marginBottom: 8 }}>The Architecture Gap</div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(244,239,230,0.05)', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#a09890', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(244,239,230,0.1)', background: 'rgba(255,255,255,0.01)' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 'normal', color: '#cdc6ba' }}>Business Impact</th>
                        <th style={{ padding: '8px 10px', fontWeight: 'normal', color: '#cdc6ba' }}>Status</th>
                        <th style={{ padding: '8px 10px', fontWeight: 'normal', color: '#cdc6ba', textAlign: 'right' }}>The Fix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          title: 'AI Discovery Passport',
                          filename: 'llms.txt',
                          status: '🔴 Missing',
                          impact: 'AI agents literally cannot "see" your site.',
                          downloadKey: 'llms_txt', ext: '.txt',
                          highlight: true
                        },
                        {
                          title: 'Robot-Readable Logic',
                          filename: 'schema.json',
                          status: '🔴 Broken',
                          impact: "AI has to guess what you sell—and it's guessing wrong.",
                          downloadKey: 'schema_json', ext: '.json'
                        },
                        {
                          title: 'Official Fact Verification',
                          filename: 'system_prompt.txt',
                          status: '🔴 Low',
                          impact: 'AI treats your claims as "unverified marketing".',
                          downloadKey: 'system_prompt', ext: '.txt'
                        },
                        {
                          title: 'Search Visibility',
                          filename: 'Google Index',
                          status: '🟢 Detected',
                          impact: 'You exist on Google, but you are invisible to AI Search.',
                          downloadKey: null
                        }
                      ].map((row, idx) => (
                        <tr key={idx} style={{
                          borderBottom: idx === 3 ? 'none' : '1px solid rgba(244,239,230,0.05)',
                          background: row.highlight ? 'rgba(255,42,50,0.04)' : 'transparent'
                        }}>
                          <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                            <div style={{ color: '#cdc6ba', fontSize: 10.5, fontWeight: 500 }}>{row.title}</div>
                          </td>
                          <td style={{ padding: '10px', verticalAlign: 'top', whiteSpace: 'nowrap', color: row.status.includes('🟢') ? '#4ade80' : '#ffb6b9', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {row.status.includes('🟢') ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {row.status.replace(/[🟢🔴]/g, '').trim()}
                          </td>
                          <td style={{ padding: '10px', verticalAlign: 'top', textAlign: 'right' }}>
                            {row.downloadKey ? (
                              <button
                                onClick={() => handleDownload(row.downloadKey, row.ext)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 6,
                                  background: row.highlight ? '#ff2a32' : 'rgba(244,239,230,0.08)',
                                  border: row.highlight ? 'none' : '1px solid rgba(244,239,230,0.12)',
                                  color: row.highlight ? '#fff' : '#cdc6ba',
                                  fontSize: 10,
                                  fontFamily: "'Geist Mono', monospace",
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  fontWeight: row.highlight ? 600 : 400,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  marginLeft: 'auto'
                                }}
                              >
                                <Download size={10} /> {row.filename}
                              </button>
                            ) : (
                              <span style={{ color: '#544e46', fontSize: 10 }}>No action needed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <button
                onClick={() => window.open('https://nando.ai/contact', '_blank')}
                style={{
                  marginTop: 10, width: '100%', height: 42, borderRadius: 10,
                  background: '#f4efe6', color: '#0a0907', border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(244,239,230,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                Contact Us <ArrowRight size={14} />
              </button>
            </div>
          )}

        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{
        __html: `
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
