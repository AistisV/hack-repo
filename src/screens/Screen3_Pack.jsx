import React, { useState } from 'react'

const TABS = [
  {
    key: 'entity_sheet',
    label: 'Entity Sheet',
    signal: 'Brand Signals',
    desc: 'Paste this unified description onto G2, Capterra, LinkedIn, Crunchbase, Wikipedia, and Trustpilot. Entity consistency across platforms is how LLMs learn who you are during training.',
    howTo: 'Copy the relevant section and paste it directly into your profile on each platform. Consistent language across all platforms is the signal — do not paraphrase.',
  },
  {
    key: 'fact_sheet',
    label: 'Fact Sheet',
    signal: 'Authority & Trust',
    desc: 'Wikipedia-style authority page. The single most comprehensive factual source about your company that AI agents can cite.',
    howTo: 'Publish this as a page on your website (e.g. /about or /company). Submit the URL to Google Search Console to accelerate indexing. AI agents cite indexed pages.',
  },
  {
    key: 'json_ld',
    label: 'JSON-LD',
    signal: 'Technical Foundation',
    desc: 'Schema.org Organization markup. Paste into your website <head> tag. Helps Google AI and search-augmented LLMs recognize your company as a verified real entity.',
    howTo: "Add inside a <script type=\"application/ld+json\"> tag in your website's <head>. Verify it at schema.org/validator before publishing.",
  },
  {
    key: 'faq_block',
    label: 'FAQ Block',
    signal: 'Answer Optimization',
    desc: 'Answers exact buyer queries AI agents receive. When AI is asked these questions — it retrieves and cites these answers directly.',
    howTo: 'Add as an FAQ section on your homepage or a dedicated /faq page. Each Q&A should be in its own HTML block with FAQ schema markup for maximum LLM citation potential.',
  },
  {
    key: 'comparison_outreach',
    label: 'Outreach Pitches',
    signal: 'Discovery',
    desc: 'Ready-to-send pitches to get listed in "best [category]" comparison articles that rank on Google. These are the pages LLMs retrieve and cite when recommending solutions.',
    howTo: "Send each pitch to the author or editor of the article (find via LinkedIn or the site's contact page). Getting listed in one high-ranking comparison article can shift your AI visibility score significantly.",
  },
]

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

export default function Screen3_Pack({ pack, companyName, onBack }) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(null)

  const handleCopy = (i) => {
    const key = TABS[i].key
    const text = pack?.[key] || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const slug = (companyName || 'company').replace(/\s+/g, '-').toLowerCase()

  const handleDownloadAll = () => {
    if (!pack) return
    const files = {
      [`${slug}-entity-sheet.md`]: pack.entity_sheet,
      [`${slug}-fact-sheet.md`]: pack.fact_sheet,
      [`${slug}-schema.jsonld`]: pack.json_ld,
      [`${slug}-faq-block.md`]: pack.faq_block,
      [`${slug}-outreach-pitches.md`]: pack.comparison_outreach,
    }
    Object.entries(files).forEach(([filename, content]) => {
      const blob = new Blob([content || ''], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const currentTab = TABS[activeTab]
  const currentContent = pack?.[currentTab.key] || 'Content not available.'

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(900px 500px at 50% 0%, rgba(255,42,50,0.04) 0%, transparent 60%),
        linear-gradient(180deg, #0a0907 0%, #100e0b 60%, #0a0907 100%)
      `,
      position: 'relative',
    }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 36px',
        background: 'rgba(10,9,7,0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(244,239,230,0.07)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: "'DM Serif Display', serif", fontSize: 22, cursor: 'default',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(circle at 35% 30%, #ffd5d7 0%, #ff2a32 35%, #5a0f12 75%, #1a0408 100%)',
            boxShadow: '0 0 14px rgba(255,42,50,0.40)',
          }} />
          Cited
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#8a8378',
            maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{companyName || 'Your Company'}</span>
          <button onClick={onBack} style={{
            height: 34, padding: '0 14px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(244,239,230,0.12)',
            color: '#cdc6ba', fontFamily: "'Geist', sans-serif",
            fontSize: 13, cursor: 'pointer',
          }}>← Back to Report</button>
        </div>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: 900, margin: '0 auto',
        padding: '48px 36px 80px',
        position: 'relative', zIndex: 1,
      }}>

        <Eyebrow>AI Recommendation Pack</Eyebrow>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif", fontWeight: 400,
          fontSize: 'clamp(30px, 4vw, 52px)',
          lineHeight: 1.04, letterSpacing: '-0.008em',
          color: '#f4efe6', marginBottom: 14,
        }}>
          Five content pieces.<br />
          <em style={{ fontStyle: 'italic', color: '#ff2a32' }}>Implement them in order.</em>
        </h2>
        <p style={{
          fontSize: 15, color: '#8a8378', marginBottom: 40, lineHeight: 1.6,
        }}>
          Each one targets an LLM SEO layer where you scored lowest. Each one compounds the next.
        </p>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 0, overflowX: 'auto',
          borderBottom: '1px solid rgba(244,239,230,0.08)',
          marginBottom: 24,
        }}>
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: '10px 20px',
              background: 'none', border: 'none',
              borderBottom: i === activeTab
                ? '2px solid #ff2a32'
                : '2px solid transparent',
              marginBottom: -1,
              color: i === activeTab ? '#f4efe6' : '#544e46',
              fontFamily: "'Geist Mono', monospace", fontSize: 11,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
          border: '1px solid rgba(244,239,230,0.12)',
          borderRadius: 22, padding: '28px 32px',
          position: 'relative',
        }}>

          {/* Signal badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: "'Geist Mono', monospace", fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            color: '#ff2a32', padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(255,42,50,0.10)',
            border: '1px solid rgba(255,42,50,0.22)',
            marginBottom: 16,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#ff2a32', flexShrink: 0,
            }} />
            {currentTab.signal}
          </div>

          <p style={{
            fontSize: 14, color: '#8a8378', marginBottom: 16, lineHeight: 1.65,
          }}>{currentTab.desc}</p>

          {/* How to use */}
          <div style={{
            background: 'rgba(244,239,230,0.03)',
            border: '1px solid rgba(244,239,230,0.10)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 22,
            fontSize: 13, color: '#cdc6ba', lineHeight: 1.6,
          }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace", fontSize: 9.5,
              textTransform: 'uppercase', letterSpacing: '0.14em',
              color: '#8a8378', marginRight: 8,
            }}>How to use:</span>
            {currentTab.howTo}
          </div>

          {/* Copy button */}
          <button onClick={() => handleCopy(activeTab)} style={{
            position: 'absolute', top: 28, right: 32,
            height: 34, padding: '0 14px', borderRadius: '999px',
            background: copied === activeTab ? 'rgba(122,208,138,0.10)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied === activeTab ? 'rgba(122,208,138,0.30)' : 'rgba(244,239,230,0.10)'}`,
            color: copied === activeTab ? '#7ad08a' : '#8a8378',
            fontFamily: "'Geist Mono', monospace", fontSize: 11,
            cursor: 'pointer', transition: 'all 0.2s',
            letterSpacing: '0.08em',
          }}>
            {copied === activeTab ? 'Copied!' : 'Copy'}
          </button>

          {/* Content */}
          <pre style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 12.5, lineHeight: 1.75,
            color: '#8a8378', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: 460, overflowY: 'auto', margin: 0,
            padding: '16px 18px',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(244,239,230,0.06)',
            borderRadius: 10,
          }}>{currentContent}</pre>
        </div>

        {/* Download all */}
        <button onClick={handleDownloadAll} style={{
          marginTop: 16, width: '100%', height: 52,
          background: 'transparent',
          border: '1px solid rgba(244,239,230,0.12)',
          borderRadius: '999px',
          color: '#cdc6ba', fontFamily: "'Geist', sans-serif",
          fontSize: 14, fontWeight: 400, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.2s, border-color 0.2s',
          letterSpacing: '0.01em',
        }}>
          ↓ Download All Five Files
        </button>

      </div>
    </div>
  )
}
