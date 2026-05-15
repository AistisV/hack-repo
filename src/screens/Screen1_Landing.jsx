import React, { useState, useEffect } from 'react'

const MARKETS = [
  { value: '', label: 'Global (default)' },
  { value: 'Germany', label: 'Germany' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'France', label: 'France' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Finland', label: 'Finland' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Japan', label: 'Japan' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'India', label: 'India' },
]

const ENGINES = ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Google AI']

function scrollTo(id) {
  if (id === 'hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
}

function Divider() {
  return (
    <div style={{
      maxWidth: 1180, margin: '0 auto', height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)',
      opacity: 0.6,
    }} />
  )
}

function Eyebrow({ children }) {
  return (
    <div className="eyebrow" style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap',
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5,
      textTransform: 'uppercase', letterSpacing: '0.18em', color: '#ff2a32',
      marginBottom: 18,
    }}>
      <div className="eyebrow-bar" style={{ width: 24, minWidth: 24, maxWidth: 24, height: 1, background: '#ff2a32', flexShrink: 0 }} />
      {children}
    </div>
  )
}

function BentoCard({ tag, title, sub, visual }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="bento-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 22,
        background: 'transparent',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)'}`,
        borderRadius: 0, padding: 30, minHeight: 440, overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 0, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.14em', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#737373' }}>{tag}</div>
        <h3 style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontWeight: 600, fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.04em', margin: '4px 0 0', color: '#FAFAFA' }}>{title}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: '#737373', margin: 0, maxWidth: 480, fontWeight: 400 }}>{sub}</p>
      </div>
      <div className="bento-card-visual" style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'flex-end', margin: '0 -10px -10px', minHeight: 0 }}>
        {visual}
      </div>
    </div>
  )
}

function PriceCard({ tier, price, period, pitch, items, cta, onCta, featured }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'transparent',
        border: featured ? '2px solid #FF3D00' : '1px solid rgba(255,255,255,0.10)',
        borderRadius: 0, padding: '32px 28px 28px',
        display: 'flex', flexDirection: 'column', gap: 22,
        transition: 'border-color 0.15s',
      }}
    >
      {featured && (
        <div style={{ position: 'absolute', top: -12, left: 28, padding: '4px 10px', borderRadius: 0, background: '#ff2a32', color: '#0A0A0A', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', whiteSpace: 'nowrap', fontWeight: 600 }}>Most popular</div>
      )}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: featured ? '#ffb6b9' : '#737373' }}>{tier}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", lineHeight: 1 }}>
        <span style={{ fontSize: 70, fontWeight: 400, letterSpacing: '-0.01em', color: '#FAFAFA' }}>{price}</span>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#737373', fontWeight: 400 }}>&nbsp;/ {period}</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: '#737373', margin: 0, minHeight: 42 }}>{pitch}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map(({ check, label }, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 13.5, lineHeight: 1.45, color: check ? '#D4D4D4' : '#525252' }}>
            <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: '50%', background: check ? (featured ? 'rgba(255,42,50,0.22)' : 'rgba(255,42,50,0.12)') : 'rgba(255,255,255,0.05)', color: check ? '#ff2a32' : '#525252', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, marginTop: 2 }}>{check ? '✓' : '—'}</span>
            {label}
          </li>
        ))}
      </ul>
      <button onClick={onCta} style={{ marginTop: 'auto', height: 46, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", background: featured ? '#ff2a32' : 'transparent', color: featured ? '#0A0A0A' : '#FAFAFA', border: featured ? 'none' : '1px solid rgba(255,255,255,0.20)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}>
        {cta}
      </button>
    </div>
  )
}

// ── Bento mock visuals ──

function VisScore() {
  return (
    <div style={{ width: '100%', background: 'rgba(10,10,10,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.10em' }}>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ff2a32', boxShadow: '0 0 8px rgba(255,42,50,0.60)', marginRight: 6, verticalAlign: 'middle' }} />
          <span style={{ color: '#FAFAFA' }}>yourcompany.com</span>
        </span>
        <span>AI Score</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '10px 0 4px' }}>
        <span style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontSize: 80, lineHeight: 1, letterSpacing: '-0.02em', color: '#ff2a32', textShadow: 'none' }}>3</span>
        <span style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontSize: 32, color: '#525252', lineHeight: 1 }}>/10</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#ff2a32', marginLeft: 8, padding: '4px 10px', borderRadius: 0, background: 'rgba(255,42,50,0.12)', border: '1px solid rgba(255,42,50,0.25)' }}>Critical</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
        {[['2', 'AI Visibility', true], ['4', 'Entity Coverage', true], ['5', 'FAQ Signals', false], ['1', 'Comparisons', true]].map(([n, lbl, bad]) => (
          <div key={lbl} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 0, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", lineHeight: 1 }}>
              <span style={{ fontSize: 32, fontWeight: 500, color: bad ? '#ff2a32' : '#FAFAFA', textShadow: 'none' }}>{n}</span>
              <span style={{ fontSize: 13, color: '#525252', fontFamily: "'Inter', system-ui, sans-serif" }}>/10</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#737373', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.10em', marginTop: 4 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisAIAnswer() {
  return (
    <div style={{ width: '100%', background: 'rgba(10,10,10,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#FAFAFA' }}>
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#737373', fontSize: 11, flexShrink: 0 }}>Q</span>
        Best B2B data enrichment tool in 2025?
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 2px' }}>
        <span style={{ color: '#FAFAFA', fontWeight: 500 }}>ChatGPT</span>
        <span>·</span>
        <span>Generating</span>
        <span style={{ display: 'inline-flex', gap: 3, marginLeft: 2 }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#737373', display: 'inline-block', animation: `dot-bounce 1.4s ${d}s ease-in-out infinite` }} />
          ))}
        </span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#737373', margin: 0, padding: '0 2px' }}>
        For B2B data enrichment, top tools include{' '}
        <span style={{ color: '#FAFAFA', fontWeight: 500, background: 'rgba(255,42,50,0.10)', padding: '0 5px', borderRadius: 0, border: '1px solid rgba(255,42,50,0.25)' }}>Clay</span>
        <span style={{ color: '#ff2a32', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", verticalAlign: 'super', padding: '0 4px', borderRadius: 0, background: 'rgba(255,42,50,0.14)', marginLeft: 2 }}>[1]</span>
        {' '}and <span style={{ color: '#FAFAFA', fontWeight: 500 }}>Apollo.io</span>.{' '}
        <span style={{ color: '#525252' }}>Your company is not mentioned.</span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>Sources</div>
        {[['1', 'clay.com', false], ['2', 'g2.com/categories/data-enrichment', false], ['3', 'yourcompany.com', true]].map(([n, src, isYou]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: isYou ? '#FAFAFA' : '#737373', fontFamily: "'JetBrains Mono', monospace", padding: '6px 8px', borderRadius: 0, background: isYou ? 'rgba(255,42,50,0.08)' : 'transparent', border: isYou ? '1px solid rgba(255,42,50,0.25)' : '1px solid transparent' }}>
            <span style={{ color: isYou ? '#ff2a32' : '#525252', fontWeight: 500, width: 22, flexShrink: 0 }}>{n}</span>
            <span>{src}</span>
            {isYou && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#ff2a32', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Not cited</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function VisGap() {
  return (
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignSelf: 'stretch' }}>
      <div style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, filter: 'saturate(0.4) opacity(0.7)', boxShadow: 'none' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#525252' }}>Before</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11.5, color: '#FAFAFA', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: '#ff2a32', fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontSize: 15, lineHeight: 1, flexShrink: 0 }}>Q</span>
            Best CRM for startups?
          </div>
          <div style={{ fontSize: 11, color: '#737373', lineHeight: 1.5, paddingLeft: 18, borderLeft: '2px solid rgba(255,42,50,0.40)', marginLeft: 4 }}>
            HubSpot, Salesforce, and Pipedrive are top choices for startups...
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#525252', padding: '6px 8px', borderRadius: 0, background: 'rgba(255,42,50,0.06)', border: '1px solid rgba(255,42,50,0.20)', marginTop: 'auto' }}>
          <span style={{ color: '#ffb6b9' }}>you</span>: not mentioned
        </div>
      </div>
      <div style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: 'none' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#ff2a32' }}>After</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11.5, color: '#FAFAFA', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: '#ff2a32', fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontSize: 15, lineHeight: 1, flexShrink: 0 }}>Q</span>
            Best CRM for startups?
          </div>
          <div style={{ fontSize: 11, color: '#D4D4D4', lineHeight: 1.5, paddingLeft: 18, borderLeft: '2px solid rgba(255,42,50,0.40)', marginLeft: 4 }}>
            <strong style={{ color: '#FAFAFA' }}>YourCRM</strong>, HubSpot, and Pipedrive — YourCRM praised for fast setup and startup-friendly pricing.
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#7ad08a', padding: '6px 8px', borderRadius: 0, background: 'rgba(122,208,138,0.06)', border: '1px solid rgba(122,208,138,0.20)', marginTop: 'auto' }}>
          <span style={{ color: '#7ad08a' }}>cited by name</span> · 5 engines
        </div>
      </div>
    </div>
  )
}

function VisContentPack() {
  const items = [
    { icon: 'ES', name: 'Entity Sheet', sub: 'G2 · LinkedIn · Crunchbase' },
    { icon: 'FS', name: 'Fact Sheet', sub: 'Website authority page' },
    { icon: 'JL', name: 'JSON-LD Schema', sub: 'Schema.org markup' },
    { icon: 'FA', name: 'FAQ Block', sub: 'Answer optimization' },
    { icon: 'OP', name: 'Outreach Pitches', sub: 'Comparison articles' },
  ]
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(({ icon, name, sub }) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 0, background: 'rgba(10,10,10,0.70)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ width: 28, height: 28, borderRadius: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>{icon}</span>
          <span>
            <span style={{ fontSize: 13, color: '#FAFAFA', fontWeight: 500, display: 'block' }}>{name}</span>
            <span style={{ fontSize: 10, color: '#525252', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.10em', marginTop: 2, display: 'block' }}>{sub}</span>
          </span>
          <span style={{ color: '#7ad08a', fontSize: 14, flexShrink: 0 }}>✓</span>
        </div>
      ))}
    </div>
  )
}

// ── Main component ──

export default function Screen1_Landing({ onSubmit, error, onLogout, session, onGoToLogin }) {
  const [input, setInput] = useState('')
  const [country, setCountry] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY + 120
      setScrolled(window.scrollY > 20)
      const ids = ['hero', 'how', 'pricing', 'cta']
      let current = 'hero'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) current = id
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSubmit = () => {
    if (!input.trim()) return
    onSubmit(input.trim(), country || null)
  }

  const navLink = (id, label) => (
    <button
      key={id}
      onClick={() => scrollTo(id)}
      style={{
        position: 'relative', padding: '6px 0', background: 'none', border: 0,
        borderBottom: activeSection === id ? '1.5px solid #FF3D00' : '1.5px solid transparent',
        color: activeSection === id ? '#FAFAFA' : '#D4D4D4',
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13.5,
        cursor: 'pointer', transition: 'color 0.2s',
      }}
    >{label}</button>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(1200px 700px at 50% 12%, rgba(255,42,50,0.05) 0%, transparent 65%),
        radial-gradient(1600px 900px at 50% 100%, rgba(255,42,50,0.03) 0%, transparent 60%),
        linear-gradient(180deg, #0A0A0A 0%, #0F0F0F 60%, #0A0A0A 100%)
      `,
      position: 'relative', overflowX: 'clip',
    }}>

      {/* ── Nav ── */}
      <nav className="nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 36px',
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.70)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <button onClick={() => scrollTo('hero')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'none', border: 0, padding: 0 }}>
          <img src="/logo.svg" alt="Cited" className="nav-logo" style={{ height: 80, width: 'auto', display: 'block' }} />
        </button>

        <div className="nav-links" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 30 }}>
          {navLink('how', 'How it works')}
          {navLink('pricing', 'Pricing')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {session
            ? <button onClick={onLogout} className="nav-signin" style={{ padding: '9px 14px', borderRadius: 0, color: '#737373', fontSize: 13.5, background: 'transparent', border: 0, cursor: 'pointer' }}>Sign out</button>
            : <button onClick={onGoToLogin} className="nav-signin" style={{ padding: '9px 14px', borderRadius: 0, color: '#737373', fontSize: 13.5, background: 'transparent', border: 0, cursor: 'pointer' }}>Sign in</button>
          }
          <button
            className="nav-cta"
            onClick={() => { scrollTo('hero'); setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 400) }}
            style={{ padding: '8px 16px', borderRadius: 0, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", background: 'transparent', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.30)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
          >Start a scan</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero">
        <div className="hero-container" style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '60px 36px 100px', minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>

          {/* Aperture rings */}
          <div className="hero-rings" style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%, -50%)', width: 'min(820px, 86vw)', aspectRatio: '1', pointerEvents: 'none', zIndex: 1, opacity: 0.9, maskImage: 'radial-gradient(closest-side, #000 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(closest-side, #000 30%, transparent 78%)' }}>
            <div style={{ position: 'absolute', inset: 0, animation: 'spin-slow 120s linear infinite' }}>
              {[88, 72].map((pct, i) => (
                <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: `1px solid rgba(255,255,255,${i === 0 ? '0.05' : '0.08'})`, boxShadow: 'inset 0 0 30px rgba(255,42,50,0.04)', width: `${pct}%`, height: `${pct}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              ))}
            </div>
            {[55, 38].map((pct, i) => (
              <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: `1px solid rgba(255,255,255,${i === 0 ? '0.08' : '0.13'})`, boxShadow: 'inset 0 0 30px rgba(255,42,50,0.04)', width: `${pct}%`, height: `${pct}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 38, maxWidth: 880, margin: '0 auto', width: '100%' }}>


            {/* Headline */}
            <h1 style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(46px, 6.6vw, 96px)', lineHeight: 1.0, letterSpacing: '-0.04em', margin: 0, color: '#FAFAFA' }}>
              Get &nbsp;
              <em style={{ fontStyle: 'italic', color: '#ff2a32' }}>
               recommended 
              </em>
              &nbsp;
               by AI
            </h1>

            {/* Subhead */}
            <p style={{ margin: 0, maxWidth: 640, fontSize: 18, lineHeight: 1.55, color: '#D4D4D4', fontWeight: 400 }}>
              See what AI says about your company right now — then get the exact content that makes AI agents{' '}
              <strong style={{ color: '#FAFAFA', fontWeight: 500 }}>recommend you by name</strong>.
            </p>

            {/* URL bar */}
            <div className="url-bar-wrapper" style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 760, gap: 0 }}>
              {/* Globe shown outside bar on mobile only */}
              <svg className="url-globe-external" style={{ display: 'none', flexShrink: 0, color: '#737373' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0 -18"/>
              </svg>
              <div className="url-bar" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', height: 66, padding: '6px 6px 6px 24px', borderRadius: 0, background: 'rgba(255,255,255,0.03)', border: `1px solid ${focused ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.14)'}`, transition: 'border-color 0.15s' }}>
                {/* Globe shown inside bar on desktop only */}
                <svg className="url-globe-internal" style={{ flexShrink: 0, color: '#737373' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0 -18"/>
                </svg>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="your website URL" style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', color: '#FAFAFA', fontSize: 16, padding: '0 14px', fontFamily: "'JetBrains Mono', monospace" }} />
                <button onClick={handleSubmit} style={{ flexShrink: 0, height: 50, padding: '0 22px', borderRadius: 0, background: 'transparent', color: '#FAFAFA', fontWeight: 600, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}>
                  <span>Scan</span><span>→</span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.85rem 1.5rem', background: 'rgba(255,42,50,0.07)', border: '1px solid rgba(255,42,50,0.25)', borderRadius: 0, fontSize: 13.5, color: '#ffb6b9', lineHeight: 1.55, fontFamily: "'JetBrains Mono', monospace", maxWidth: 760, width: '100%' }}>
                {error}
              </div>
            )}

            {/* Engine list */}
            <div className="engine-list" style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              <span style={{ color: '#525252' }}>Analyzed for</span>
              {ENGINES.map((e, i) => (
                <React.Fragment key={e}>
                  <span style={{ color: '#737373' }}>{e}</span>
                  {i < ENGINES.length - 1 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#525252', opacity: 0.6, flexShrink: 0, display: 'inline-block' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── How it works ── */}
      <section id="how">
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 36px 120px', position: 'relative' }}>
          <Eyebrow>How Cited works</Eyebrow>
          <h2 style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontWeight: 400, fontSize: 'clamp(40px, 5.6vw, 76px)', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 22px', color: '#FAFAFA', maxWidth: 840 }}>
            From invisible to <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: 'none' }}>recommended by AI</em>
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: '#737373', maxWidth: 680, margin: '0 0 64px', fontWeight: 400 }}>
            Four steps, one scan. See exactly where you stand — then get the content to fix it.
          </p>
          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <BentoCard tag="Step 01" title="Scan your company" sub="We score how well AI engines understand who you are — across entity coverage, FAQ signals, and comparison visibility." visual={<VisScore />} />
            <BentoCard tag="Step 02" title="See live AI answers" sub="We run real buyer queries on ChatGPT, Perplexity, Gemini, Claude and Google AI and capture exactly what they say." visual={<VisAIAnswer />} />
            <BentoCard tag="Step 03" title="Uncover your gaps" sub="Find which queries you're missing from and exactly which competitors AI recommends instead of you." visual={<VisGap />} />
            <BentoCard tag="Step 04" title="Get your content pack" sub="Five ready-to-deploy content pieces that teach AI engines to recommend you by name — implement them in order." visual={<VisContentPack />} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Pricing ── */}
      <section id="pricing">
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 36px 120px', position: 'relative' }}>
          <Eyebrow>Pricing · No credit card</Eyebrow>
          <h2 style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontWeight: 400, fontSize: 'clamp(40px, 5.6vw, 76px)', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 22px', color: '#FAFAFA', maxWidth: 840 }}>
            Know where you stand. <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: 'none' }}>Fix what matters.</em>
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: '#737373', maxWidth: 680, margin: '0 0 64px', fontWeight: 400 }}>
            Start free. Results in under 3 minutes.
          </p>
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <PriceCard
              tier="Starter" price="$0" period="one-time scan"
              pitch="Your AI visibility score and top quick wins. No credit card."
              items={[
                { check: true, label: 'Full AI score across 5 engines' },
                { check: true, label: 'Live buyer query analysis' },
                { check: true, label: 'Top 3 quick wins ranked by impact' },
                { check: true, label: 'Competitor gap snapshot' },
                { check: false, label: 'Full recommendation content pack' },
                { check: false, label: 'Entity Sheet · Fact Sheet · JSON-LD' },
                { check: false, label: 'Outreach pitches for comparison sites' },
              ]}
              cta="Run free scan"
              onCta={() => {
                if (!input.trim()) {
                  scrollTo('hero')
                  setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 400)
                } else {
                  handleSubmit()
                }
              }}
            />
            <PriceCard
              tier="Growth" price="$49" period="per scan" featured
              pitch="The full report plus every content piece, ready to deploy."
              items={[
                { check: true, label: 'Everything in Starter' },
                { check: true, label: 'Full AI recommendation pack — all 5 pieces' },
                { check: true, label: 'Entity Sheet · Fact Sheet · JSON-LD' },
                { check: true, label: 'FAQ Block optimized for buyer queries' },
                { check: true, label: 'Outreach pitches for comparison articles' },
              ]}
              cta="Get the full pack"
              onCta={() => scrollTo('hero')}
            />
            <PriceCard
              tier="Agency" price="$149" period="per month"
              pitch="Unlimited scans for all your clients. White-label reports."
              items={[
                { check: true, label: 'Unlimited scans across all clients' },
                { check: true, label: 'White-label report export (PDF + ZIP)' },
                { check: true, label: 'Team seat access' },
                { check: true, label: 'Priority scan queue' },
                { check: true, label: 'Custom market targeting' },
                { check: true, label: 'API access for bulk scanning' },
              ]}
              cta="Talk to us"
              onCta={() => {}}
            />
          </div>
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            <span>No long-term contract · Cancel anytime · Results in under 3 min</span>
            <span>Questions? hello@visibly.so</span>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── CTA ── */}
      <section id="cta">
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '140px 36px 160px', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'min(900px, 90%)', aspectRatio: '1.6', background: 'radial-gradient(ellipse at center, rgba(255,42,50,0.18), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, maxWidth: 820, margin: '0 auto' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#ff2a32', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 1, background: '#ff2a32', opacity: 0.6, flexShrink: 0 }} />
              Don't wait for the next algorithm update
              <span style={{ width: 24, height: 1, background: '#ff2a32', opacity: 0.6, flexShrink: 0 }} />
            </div>
            <h2 style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(40px, 5.8vw, 86px)', lineHeight: 1.1, letterSpacing: '-0.04em', margin: 0, color: '#FAFAFA' }}>
              Every day you wait, <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: 'none' }}>another competitor</em> gets recommended instead.
            </h2>
            <p style={{ margin: 0, maxWidth: 560, fontSize: 16, lineHeight: 1.55, color: '#D4D4D4' }}>
              Run the free scan, see your gap, and get the exact content that makes AI engines recommend you by name.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => scrollTo('hero')} style={{ height: 52, padding: '0 28px', borderRadius: 0, background: '#ff2a32', color: '#0A0A0A', fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, transition: 'opacity 0.15s' }}>
                <span>Run free scan</span><span>→</span>
              </button>
              <button onClick={() => scrollTo('pricing')} style={{ height: 52, padding: '0 22px', borderRadius: 0, background: 'transparent', color: '#FAFAFA', fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", border: '1px solid rgba(255,255,255,0.20)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'border-color 0.15s' }}>
                See pricing
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 6 }}>
              <span>No credit card</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#525252', display: 'inline-block' }} />
              <span>Results in ~3 min</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#525252', display: 'inline-block' }} />
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 5, maxWidth: 1440, margin: '0 auto', padding: '22px 36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#525252', fontSize: 12, letterSpacing: '0.02em', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.svg" alt="Cited" style={{ height: 80, width: 100, display: 'block', opacity: 0.5 }} />
          <span>2026 Cited · All rights reserved</span>
        </div>
        <div className="footer-links" style={{ display: 'flex', gap: 22 }}>
          {[['how', 'How it works'], ['pricing', 'Pricing']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ color: '#525252', background: 'none', border: 0, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</button>
          ))}
          <span style={{ color: '#525252' }}>Contact</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dot-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(255,42,50,0.5); }
          70% { box-shadow: 0 0 0 10px rgba(255,42,50,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,42,50,0); }
        }
        
        @media (max-width: 768px) {
          nav { padding: 10px 16px !important; }
          .nav-links { display: none !important; }
          .nav-logo { height: 40px !important; }
          .nav-signin { padding: 5px 10px !important; font-size: 12px !important; }
          .nav-cta { padding: 5px 12px !important; font-size: 12px !important; }

          .hero-container { padding: 36px 20px 60px !important; min-height: auto !important; }
          .hero-rings { display: none !important; }

          /* Globe outside bar on mobile */
          .url-bar-wrapper { gap: 10px !important; }
          .url-globe-external { display: block !important; flex-shrink: 0 !important; }
          .url-globe-internal { display: none !important; }

          /* Compact horizontal bar — input takes space, button stays small */
          .url-bar {
            height: auto !important;
            padding: 8px 8px 8px 14px !important;
            border-radius: 0 !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 6px !important;
            align-items: center !important;
          }
          .url-bar input { flex: 1 !important; min-width: 0 !important; padding: 4px 6px !important; font-size: 15px !important; }
          .url-bar button { flex: 0 0 auto !important; width: auto !important; height: 38px !important; padding: 0 14px !important; border-radius: 0 !important; font-size: 11px !important; }

          #how > div { padding: 40px 20px 40px !important; }
          #pricing > div { padding: 60px 20px 60px !important; }
          #cta > div { padding: 80px 20px 100px !important; }

          .bento-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; gap: 16px !important; }

          /* Bento cards: remove fixed min-height, let visuals show fully */
          .bento-card { min-height: 0 !important; padding: 20px !important; gap: 16px !important; }
          .bento-card-visual { max-height: none !important; overflow: visible !important; align-items: flex-start !important; }

          /* Eyebrow bar stays fixed-width */
          .eyebrow-bar { width: 24px !important; min-width: 24px !important; max-width: 24px !important; }

          .engine-list { flex-wrap: wrap !important; justify-content: center !important; gap: 10px !important; }

          footer { flex-direction: column !important; gap: 20px !important; text-align: center !important; }
          footer .footer-links { justify-content: center !important; }
        }
      ` }} />
    </div>
  )
}
