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
      background: 'linear-gradient(90deg, transparent, rgba(244,239,230,0.08) 30%, rgba(244,239,230,0.08) 70%, transparent)',
      opacity: 0.6,
    }} />
  )
}

function Eyebrow({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: "'Geist Mono', monospace", fontSize: 11.5,
      textTransform: 'uppercase', letterSpacing: '0.18em', color: '#ff2a32',
      marginBottom: 18,
    }}>
      <div style={{ width: 24, height: 1, background: '#ff2a32', flexShrink: 0 }} />
      {children}
    </div>
  )
}

function BentoCard({ tag, title, sub, visual }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 22,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
        border: `1px solid ${hovered ? 'rgba(244,239,230,0.22)' : 'rgba(244,239,230,0.16)'}`,
        borderRadius: 22, padding: 30, minHeight: 440, overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'border-color 0.25s, transform 0.25s',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(700px 320px at 50% 0%, rgba(255,42,50,0.10), transparent 60%)', opacity: 0.55 }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontFamily: "'Geist Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.12em', width: 'fit-content', background: 'rgba(244,239,230,0.05)', border: '1px solid rgba(244,239,230,0.16)', color: '#cdc6ba' }}>{tag}</div>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.005em', margin: '4px 0 0', color: '#f4efe6' }}>{title}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: '#8a8378', margin: 0, maxWidth: 480, fontWeight: 400 }}>{sub}</p>
      </div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'flex-end', margin: '0 -10px -10px', minHeight: 0 }}>
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
        background: featured
          ? 'linear-gradient(180deg, rgba(255,42,50,0.08), rgba(255,42,50,0.01))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
        border: featured ? '1px solid rgba(255,42,50,0.45)' : '1px solid rgba(244,239,230,0.16)',
        borderRadius: 18, padding: '32px 28px 28px',
        display: 'flex', flexDirection: 'column', gap: 22,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.2s, border-color 0.2s',
        boxShadow: featured ? '0 0 0 1px rgba(255,42,50,0.15), 0 30px 80px -30px rgba(255,42,50,0.35)' : 'none',
      }}
    >
      {featured && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '5px 12px', borderRadius: 999, background: '#ff2a32', color: '#fff', fontFamily: "'Geist Mono', monospace", fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', boxShadow: '0 0 24px rgba(255,42,50,0.45)', whiteSpace: 'nowrap' }}>Most popular</div>
      )}
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.16em', color: featured ? '#ffb6b9' : '#8a8378' }}>{tier}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
        <span style={{ fontSize: 70, fontWeight: 400, letterSpacing: '-0.01em', color: '#f4efe6' }}>{price}</span>
        <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: '#8a8378', fontWeight: 400 }}>&nbsp;/ {period}</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: '#8a8378', margin: 0, minHeight: 42 }}>{pitch}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map(({ check, label }, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 13.5, lineHeight: 1.45, color: check ? '#cdc6ba' : '#544e46' }}>
            <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: '50%', background: check ? (featured ? 'rgba(255,42,50,0.22)' : 'rgba(255,42,50,0.12)') : 'rgba(244,239,230,0.05)', color: check ? '#ff2a32' : '#544e46', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, marginTop: 2 }}>{check ? '✓' : '—'}</span>
            {label}
          </li>
        ))}
      </ul>
      <button onClick={onCta} style={{ marginTop: 'auto', height: 46, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, background: featured ? '#ff2a32' : 'rgba(255,255,255,0.06)', color: featured ? '#fff' : '#f4efe6', border: featured ? 'none' : '1px solid rgba(244,239,230,0.16)', cursor: 'pointer', transition: 'background 0.2s, transform 0.15s', boxShadow: featured ? '0 10px 30px -10px rgba(255,42,50,0.45)' : 'none' }}>
        {cta}
      </button>
    </div>
  )
}

// ── Bento mock visuals ──

function VisScore() {
  return (
    <div style={{ width: '100%', background: 'rgba(8,7,5,0.70)', border: '1px solid rgba(244,239,230,0.08)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.60)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#8a8378', textTransform: 'uppercase', letterSpacing: '0.10em' }}>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ff2a32', boxShadow: '0 0 8px rgba(255,42,50,0.60)', marginRight: 6, verticalAlign: 'middle' }} />
          <span style={{ color: '#f4efe6' }}>yourcompany.com</span>
        </span>
        <span>AI Score</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '10px 0 4px' }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 80, lineHeight: 1, letterSpacing: '-0.02em', color: '#ff2a32', textShadow: '0 0 24px rgba(255,42,50,0.35)' }}>3</span>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#544e46', lineHeight: 1 }}>/10</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#ff2a32', marginLeft: 8, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,42,50,0.12)', border: '1px solid rgba(255,42,50,0.25)' }}>Critical</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['2', 'AI Visibility', true], ['4', 'Entity Coverage', true], ['5', 'FAQ Signals', false], ['1', 'Comparisons', true]].map(([n, lbl, bad]) => (
          <div key={lbl} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(244,239,230,0.08)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
              <span style={{ fontSize: 32, fontWeight: 500, color: bad ? '#ff2a32' : '#f4efe6', textShadow: bad ? '0 0 14px rgba(255,42,50,0.4)' : 'none' }}>{n}</span>
              <span style={{ fontSize: 13, color: '#544e46', fontFamily: "'Geist', sans-serif" }}>/10</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#8a8378', fontFamily: "'Geist Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.10em', marginTop: 4 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisAIAnswer() {
  return (
    <div style={{ width: '100%', background: 'rgba(8,7,5,0.70)', border: '1px solid rgba(244,239,230,0.08)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.60)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(244,239,230,0.08)', fontSize: 13, color: '#f4efe6' }}>
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#8a8378', fontSize: 11, flexShrink: 0 }}>Q</span>
        Best B2B data enrichment tool in 2025?
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Geist Mono', monospace", fontSize: 10.5, color: '#8a8378', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 2px' }}>
        <span style={{ color: '#f4efe6', fontWeight: 500 }}>ChatGPT</span>
        <span>·</span>
        <span>Generating</span>
        <span style={{ display: 'inline-flex', gap: 3, marginLeft: 2 }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#8a8378', display: 'inline-block', animation: `dot-bounce 1.4s ${d}s ease-in-out infinite` }} />
          ))}
        </span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#8a8378', margin: 0, padding: '0 2px' }}>
        For B2B data enrichment, top tools include{' '}
        <span style={{ color: '#f4efe6', fontWeight: 500, background: 'rgba(255,42,50,0.10)', padding: '0 5px', borderRadius: 4, border: '1px solid rgba(255,42,50,0.25)' }}>Clay</span>
        <span style={{ color: '#ff2a32', fontSize: 10, fontFamily: "'Geist Mono', monospace", verticalAlign: 'super', padding: '0 4px', borderRadius: 4, background: 'rgba(255,42,50,0.14)', marginLeft: 2 }}>[1]</span>
        {' '}and <span style={{ color: '#f4efe6', fontWeight: 500 }}>Apollo.io</span>.{' '}
        <span style={{ color: '#544e46' }}>Your company is not mentioned.</span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px dashed rgba(244,239,230,0.08)' }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#544e46', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>Sources</div>
        {[['1', 'clay.com', false], ['2', 'g2.com/categories/data-enrichment', false], ['3', 'yourcompany.com', true]].map(([n, src, isYou]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: isYou ? '#f4efe6' : '#8a8378', fontFamily: "'Geist Mono', monospace", padding: '6px 8px', borderRadius: 6, background: isYou ? 'rgba(255,42,50,0.08)' : 'transparent', border: isYou ? '1px solid rgba(255,42,50,0.25)' : '1px solid transparent' }}>
            <span style={{ color: isYou ? '#ff2a32' : '#544e46', fontWeight: 500, width: 22, flexShrink: 0 }}>{n}</span>
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
      <div style={{ background: 'rgba(8,7,5,0.70)', border: '1px solid rgba(244,239,230,0.08)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, filter: 'saturate(0.4) opacity(0.7)', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.60)' }}>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#544e46' }}>Before</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11.5, color: '#f4efe6', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: '#ff2a32', fontFamily: "'DM Serif Display', serif", fontSize: 15, lineHeight: 1, flexShrink: 0 }}>Q</span>
            Best CRM for startups?
          </div>
          <div style={{ fontSize: 11, color: '#8a8378', lineHeight: 1.5, paddingLeft: 18, borderLeft: '2px solid rgba(255,42,50,0.40)', marginLeft: 4 }}>
            HubSpot, Salesforce, and Pipedrive are top choices for startups...
          </div>
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#544e46', padding: '6px 8px', borderRadius: 6, background: 'rgba(255,42,50,0.06)', border: '1px solid rgba(255,42,50,0.20)', marginTop: 'auto' }}>
          <span style={{ color: '#ffb6b9' }}>you</span>: not mentioned
        </div>
      </div>
      <div style={{ background: 'rgba(8,7,5,0.70)', border: '1px solid rgba(244,239,230,0.08)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.60)' }}>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#ff2a32' }}>After</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11.5, color: '#f4efe6', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: '#ff2a32', fontFamily: "'DM Serif Display', serif", fontSize: 15, lineHeight: 1, flexShrink: 0 }}>Q</span>
            Best CRM for startups?
          </div>
          <div style={{ fontSize: 11, color: '#cdc6ba', lineHeight: 1.5, paddingLeft: 18, borderLeft: '2px solid rgba(255,42,50,0.40)', marginLeft: 4 }}>
            <strong style={{ color: '#f4efe6' }}>YourCRM</strong>, HubSpot, and Pipedrive — YourCRM praised for fast setup and startup-friendly pricing.
          </div>
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#7ad08a', padding: '6px 8px', borderRadius: 6, background: 'rgba(122,208,138,0.06)', border: '1px solid rgba(122,208,138,0.20)', marginTop: 'auto' }}>
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
        <div key={name} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 12, background: 'rgba(8,7,5,0.60)', border: '1px solid rgba(244,239,230,0.08)' }}>
          <span style={{ width: 28, height: 28, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: '#f4efe6', border: '1px solid rgba(244,239,230,0.08)', flexShrink: 0 }}>{icon}</span>
          <span>
            <span style={{ fontSize: 13, color: '#f4efe6', fontWeight: 500, display: 'block' }}>{name}</span>
            <span style={{ fontSize: 10, color: '#544e46', fontFamily: "'Geist Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.10em', marginTop: 2, display: 'block' }}>{sub}</span>
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
        borderBottom: activeSection === id ? '1.5px solid #ff2a32' : '1.5px solid transparent',
        color: activeSection === id ? '#f4efe6' : '#cdc6ba',
        fontFamily: "'Geist', sans-serif", fontSize: 13.5,
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
        linear-gradient(180deg, #0a0907 0%, #100e0b 60%, #0a0907 100%)
      `,
      position: 'relative', overflowX: 'clip',
    }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 36px',
        background: scrolled ? 'rgba(10,9,7,0.78)' : 'rgba(10,9,7,0.55)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderBottom: scrolled ? '1px solid rgba(244,239,230,0.07)' : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <button onClick={() => scrollTo('hero')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'none', border: 0, padding: 0 }}>
          <img src="/logo.svg" alt="Cited" style={{ height: 80, width: 'auto', display: 'block' }} />
        </button>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 30 }}>
          {navLink('how', 'How it works')}
          {navLink('pricing', 'Pricing')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {session
            ? <button onClick={onLogout} style={{ padding: '9px 14px', borderRadius: 999, color: '#cdc6ba', fontSize: 13.5, background: 'transparent', border: 0, cursor: 'pointer' }}>Sign out</button>
            : <button onClick={onGoToLogin} style={{ padding: '9px 14px', borderRadius: 999, color: '#cdc6ba', fontSize: 13.5, background: 'transparent', border: 0, cursor: 'pointer' }}>Sign in</button>
          }
          <button
            onClick={() => { scrollTo('hero'); setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 400) }}
            style={{ padding: '9px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 500, background: '#f4efe6', color: '#15110d', border: 0, cursor: 'pointer', boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 24px rgba(244,239,230,0.06)', transition: 'transform 0.15s' }}
          >Start a scan</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero">
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '60px 36px 100px', minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>

          {/* Aperture rings */}
          <div style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%, -50%)', width: 'min(820px, 86vw)', aspectRatio: '1', pointerEvents: 'none', zIndex: 1, opacity: 0.9, maskImage: 'radial-gradient(closest-side, #000 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(closest-side, #000 30%, transparent 78%)' }}>
            <div style={{ position: 'absolute', inset: 0, animation: 'spin-slow 120s linear infinite' }}>
              {[88, 72].map((pct, i) => (
                <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: `1px solid rgba(244,239,230,${i === 0 ? '0.05' : '0.08'})`, boxShadow: 'inset 0 0 30px rgba(255,42,50,0.04)', width: `${pct}%`, height: `${pct}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              ))}
            </div>
            {[55, 38].map((pct, i) => (
              <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: `1px solid rgba(244,239,230,${i === 0 ? '0.08' : '0.13'})`, boxShadow: 'inset 0 0 30px rgba(255,42,50,0.04)', width: `${pct}%`, height: `${pct}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 38, maxWidth: 880, margin: '0 auto', width: '100%' }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(244,239,230,0.16)', fontSize: 12.5, color: '#cdc6ba', letterSpacing: '0.01em', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 0 0 1px rgba(255,42,50,0.06), 0 0 24px rgba(255,42,50,0.04)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: '#ff2a32', animation: 'pulse-ring 2.2s ease-out infinite' }} />
              AI Recommendation Engine
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(46px, 6.6vw, 96px)', lineHeight: 1.02, letterSpacing: '-0.01em', margin: 0, color: '#f4efe6' }}>
              Get &nbsp;
              <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: '0 0 18px rgba(255,42,50,0.30)' }}>
               recommended 
              </em>
              &nbsp;
               by AI.{' '}
            </h1>

            {/* Subhead */}
            <p style={{ margin: 0, maxWidth: 640, fontSize: 18, lineHeight: 1.55, color: '#cdc6ba', fontWeight: 400 }}>
              See what AI says about your company right now — then get the exact content that makes AI agents{' '}
              <strong style={{ color: '#f4efe6', fontWeight: 500 }}>recommend you by name</strong>.
            </p>

            {/* URL bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: 760, height: 66, padding: '6px 6px 6px 24px', borderRadius: 999, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))', border: `1px solid ${focused ? 'rgba(244,239,230,0.22)' : 'rgba(244,239,230,0.10)'}`, boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 60px -20px rgba(0,0,0,0.60)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transition: 'border-color 0.25s' }}>
              <svg style={{ flexShrink: 0, color: '#8a8378' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0 -18"/>
              </svg>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="company name or website URL" style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', color: '#f4efe6', fontSize: 16, padding: '0 14px', fontFamily: "'Geist Mono', 'SFMono-Regular', monospace" }} />
              <div style={{ width: 1, height: 26, flexShrink: 0, background: 'rgba(244,239,230,0.10)' }} />
              <select value={country} onChange={e => setCountry(e.target.value)} style={{ background: 'transparent', border: 0, outline: 'none', color: country ? '#f4efe6' : '#544e46', fontFamily: "'Geist', sans-serif", fontSize: 13, padding: '0 10px 0 14px', cursor: 'pointer', appearance: 'none', maxWidth: 140, flexShrink: 0 }}>
                {MARKETS.map(m => (
                  <option key={m.value} value={m.value} style={{ background: '#100e0b', color: '#f4efe6' }}>{m.label}</option>
                ))}
              </select>
              <button onClick={handleSubmit} style={{ flexShrink: 0, height: 50, padding: '0 24px', borderRadius: 999, background: '#f4efe6', color: '#15110d', fontWeight: 500, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', boxShadow: '0 6px 18px rgba(244,239,230,0.10), 0 1px 0 rgba(255,255,255,0.5) inset', transition: 'transform 0.15s' }}>
                <span>Scan</span><span>→</span>
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.85rem 1.5rem', background: 'rgba(255,42,50,0.07)', border: '1px solid rgba(255,42,50,0.25)', borderRadius: 12, fontSize: 13.5, color: '#ffb6b9', lineHeight: 1.55, fontFamily: "'Geist Mono', monospace", maxWidth: 760, width: '100%' }}>
                {error}
              </div>
            )}

            {/* Engine list */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: "'Geist Mono', monospace", fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              <span style={{ color: '#544e46' }}>Analyzed for</span>
              {ENGINES.map((e, i) => (
                <React.Fragment key={e}>
                  <span style={{ color: '#8a8378' }}>{e}</span>
                  {i < ENGINES.length - 1 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#544e46', opacity: 0.6, flexShrink: 0, display: 'inline-block' }} />}
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
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(40px, 5.6vw, 76px)', lineHeight: 1.04, letterSpacing: '-0.008em', margin: '0 0 22px', color: '#f4efe6', maxWidth: 840 }}>
            From invisible to <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: '0 0 18px rgba(255,42,50,0.25)' }}>recommended by AI</em>.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: '#8a8378', maxWidth: 680, margin: '0 0 64px', fontWeight: 400 }}>
            Four steps, one scan. See exactly where you stand — then get the content to fix it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
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
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(40px, 5.6vw, 76px)', lineHeight: 1.04, letterSpacing: '-0.008em', margin: '0 0 22px', color: '#f4efe6', maxWidth: 840 }}>
            Know where you stand. <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: '0 0 18px rgba(255,42,50,0.25)' }}>Fix what matters.</em>
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: '#8a8378', maxWidth: 680, margin: '0 0 64px', fontWeight: 400 }}>
            Start free. Results in under 3 minutes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(244,239,230,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: '#544e46', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
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
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#ff2a32', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 1, background: '#ff2a32', opacity: 0.6, flexShrink: 0 }} />
              Don't wait for the next algorithm update
              <span style={{ width: 24, height: 1, background: '#ff2a32', opacity: 0.6, flexShrink: 0 }} />
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(40px, 5.8vw, 86px)', lineHeight: 1.04, letterSpacing: '-0.008em', margin: 0, color: '#f4efe6' }}>
              Every day you wait, <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: '0 0 18px rgba(255,42,50,0.25)' }}>another competitor</em> gets recommended instead.
            </h2>
            <p style={{ margin: 0, maxWidth: 560, fontSize: 16, lineHeight: 1.55, color: '#cdc6ba' }}>
              Run the free scan, see your gap, and get the exact content that makes AI engines recommend you by name.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => scrollTo('hero')} style={{ height: 56, padding: '0 28px', borderRadius: 999, background: '#ff2a32', color: '#fff', fontSize: 15, fontWeight: 500, border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 14px 40px -10px rgba(255,42,50,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset', transition: 'transform 0.15s, background 0.2s' }}>
                <span>Run free scan</span><span>→</span>
              </button>
              <button onClick={() => scrollTo('pricing')} style={{ height: 56, padding: '0 22px', borderRadius: 999, background: 'transparent', color: '#f4efe6', fontSize: 15, fontWeight: 400, border: '1px solid rgba(244,239,230,0.16)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.2s, border-color 0.2s' }}>
                See pricing
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#544e46', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 6 }}>
              <span>No credit card</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#544e46', display: 'inline-block' }} />
              <span>Results in ~3 min</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#544e46', display: 'inline-block' }} />
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 5, maxWidth: 1440, margin: '0 auto', padding: '22px 36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#544e46', fontSize: 12, letterSpacing: '0.02em', fontFamily: "'Geist Mono', monospace", textTransform: 'uppercase', borderTop: '1px solid rgba(244,239,230,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.svg" alt="Cited" style={{ height: 80, width: 100, display: 'block', opacity: 0.5 }} />
          <span>2026 Cited · All rights reserved</span>
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          {[['how', 'How it works'], ['pricing', 'Pricing']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ color: '#544e46', background: 'none', border: 0, cursor: 'pointer', fontFamily: "'Geist Mono', monospace", fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</button>
          ))}
          <span style={{ color: '#544e46' }}>Contact</span>
        </div>
      </footer>

    </div>
  )
}
