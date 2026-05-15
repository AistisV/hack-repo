import React from 'react'

const scoreColor = (s) => {
  if (s == null) return '#544e46'
  if (s <= 3) return '#ff2a32'
  if (s <= 6) return '#cdc6ba'
  return '#7ad08a'
}

const scoreShadow = (s) => {
  if (s == null) return 'none'
  if (s <= 3) return '0 0 22px rgba(255,42,50,0.35)'
  if (s <= 6) return 'none'
  return '0 0 18px rgba(122,208,138,0.28)'
}

const STRENGTH_COLOR = { strong: '#7ad08a', weak: '#cdc6ba', none: '#ff2a32' }
const STRENGTH_LABEL = { strong: 'Recommended', weak: 'Weak signal', none: 'Not mentioned' }
const STRENGTH_BG    = {
  strong: 'rgba(122,208,138,0.10)',
  weak:   'rgba(205,198,186,0.10)',
  none:   'rgba(255,42,50,0.10)',
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

function ScoreCard({ score, label, large }) {
  const s = score ?? 0
  const col = scoreColor(s)
  const shadow = scoreShadow(s)
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
      border: '1px solid rgba(244,239,230,0.12)',
      borderRadius: 18, padding: large ? '28px 32px' : '22px 24px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, lineHeight: 1 }}>
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: large ? 80 : 48,
          fontWeight: 400, letterSpacing: '-0.02em',
          color: col, textShadow: shadow,
        }}>{s}</span>
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: large ? 28 : 18,
          color: '#544e46', lineHeight: 1,
        }}>/10</span>
      </div>
      <div style={{
        fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
        textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8378',
        marginTop: 4,
      }}>{label}</div>
    </div>
  )
}

export default function Screen2_Report({ reportData, onViewPack, onNewScan }) {
  if (!reportData) return null
  const { profile, gaps } = reportData
  const name = profile?.company_name || 'Your Company'
  const displayScore = gaps?.combined_score ?? gaps?.overall_recommendation_score ?? 0
  const entityPresence = gaps?.entity_presence || []
  const topCompetitors = gaps?.top_competitors || []

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
            fontFamily: "'Geist Mono', monospace", fontSize: 12,
            color: '#8a8378', maxWidth: 200,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{name}</span>
          <button onClick={onNewScan} style={{
            height: 34, padding: '0 14px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(244,239,230,0.12)',
            color: '#cdc6ba', fontFamily: "'Geist', sans-serif",
            fontSize: 13, cursor: 'pointer', transition: 'background 0.2s',
          }}>← New Scan</button>
        </div>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: 900, margin: '0 auto',
        padding: '48px 36px 80px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Section header */}
        <Eyebrow>AI Visibility Report</Eyebrow>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif", fontWeight: 400,
          fontSize: 'clamp(32px, 4vw, 56px)',
          lineHeight: 1.04, letterSpacing: '-0.008em',
          color: '#f4efe6', marginBottom: 40,
        }}>
          Here's what AI knows<br />
          <em style={{ fontStyle: 'italic', color: '#ff2a32', textShadow: '0 0 16px rgba(255,42,50,0.22)' }}>
            about {name}
          </em>
        </h2>

        {/* Main score + explanation */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr',
          gap: 28, alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
          border: '1px solid rgba(244,239,230,0.12)',
          borderRadius: 22, padding: '32px 36px', marginBottom: 16,
        }}>
          <ScoreCard score={displayScore} label="AI Visibility Score" large />
          <div>
            <div style={{
              fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
              textTransform: 'uppercase', letterSpacing: '0.14em',
              color: displayScore <= 3 ? '#ff2a32' : displayScore <= 6 ? '#8a8378' : '#7ad08a',
              padding: '4px 10px', borderRadius: '999px', display: 'inline-block',
              background: displayScore <= 3 ? 'rgba(255,42,50,0.12)' : displayScore <= 6 ? 'rgba(244,239,230,0.06)' : 'rgba(122,208,138,0.12)',
              border: `1px solid ${displayScore <= 3 ? 'rgba(255,42,50,0.25)' : displayScore <= 6 ? 'rgba(244,239,230,0.10)' : 'rgba(122,208,138,0.25)'}`,
              marginBottom: 14,
            }}>
              {displayScore <= 3 ? 'Critical' : displayScore <= 6 ? 'Moderate' : 'Strong'}
            </div>
            <p style={{
              fontSize: 15, color: '#cdc6ba', lineHeight: 1.65, margin: 0,
            }}>
              {gaps?.score_explanation || 'Analysis complete.'}
            </p>
          </div>
        </div>

        {/* 4 sub-scores */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 12, marginBottom: 28,
        }}>
          {[
            { score: gaps?.overall_recommendation_score, label: 'AI Presence' },
            { score: gaps?.content_quality_score,        label: 'Content Quality' },
            { score: gaps?.entity_signals_score,         label: 'Entity Signals' },
            { score: gaps?.authority_score,              label: 'Authority & Trust' },
          ].map(({ score, label }) => (
            <ScoreCard key={label} score={score} label={label} />
          ))}
        </div>

        {/* Entity presence */}
        {entityPresence.length > 0 && (
          <div style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
            border: '1px solid rgba(244,239,230,0.12)',
            borderRadius: 18, padding: '24px 28px', marginBottom: 16,
          }}>
            <div style={{
              fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
              textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8a8378',
              marginBottom: 16,
            }}>Platform Presence — LLM Training Sources</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {entityPresence.map(({ name: platform, present }) => (
                <div key={platform} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 12px', borderRadius: '999px',
                  background: present ? 'rgba(122,208,138,0.08)' : 'rgba(255,42,50,0.08)',
                  border: `1px solid ${present ? 'rgba(122,208,138,0.22)' : 'rgba(255,42,50,0.22)'}`,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: present ? '#7ad08a' : '#ff2a32',
                    boxShadow: present ? '0 0 6px rgba(122,208,138,0.5)' : '0 0 6px rgba(255,42,50,0.5)',
                  }} />
                  <span style={{
                    fontFamily: "'Geist Mono', monospace", fontSize: 11,
                    color: present ? '#bfe9c8' : '#ffb6b9',
                  }}>{platform}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most damaging gap */}
        {gaps?.most_damaging_gap && (
          <div style={{
            background: 'rgba(255,42,50,0.05)',
            border: '1px solid rgba(255,42,50,0.20)',
            borderLeft: '3px solid #ff2a32',
            borderRadius: 14, padding: '22px 24px', marginBottom: 16,
          }}>
            <div style={{
              fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
              textTransform: 'uppercase', letterSpacing: '0.16em', color: '#ff2a32',
              marginBottom: 10,
            }}>Most Damaging Gap</div>
            <p style={{ fontSize: 14.5, color: '#f4efe6', lineHeight: 1.65, margin: 0 }}>
              {gaps.most_damaging_gap}
            </p>
          </div>
        )}

        {/* Competitors winning */}
        {topCompetitors.length > 0 && (
          <div style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))',
            border: '1px solid rgba(244,239,230,0.12)',
            borderLeft: '3px solid #cdc6ba',
            borderRadius: 14, padding: '22px 24px', marginBottom: 32,
          }}>
            <div style={{
              fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
              textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8a8378',
              marginBottom: 14,
            }}>Winning Instead of You</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topCompetitors.slice(0, 3).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 22, fontWeight: 400, color: '#f4efe6',
                    lineHeight: 1, minWidth: 28, textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 15, color: '#cdc6ba', flex: 1 }}>{c.name}</span>
                  <span style={{
                    fontFamily: "'Geist Mono', monospace", fontSize: 10,
                    color: '#8a8378',
                    padding: '3px 8px', borderRadius: '999px',
                    background: 'rgba(244,239,230,0.05)',
                    border: '1px solid rgba(244,239,230,0.08)',
                  }}>{c.query_count}/{(gaps?.query_results || []).length || 10} queries</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query results */}
        <Eyebrow>Buying Intent Query Results</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {(gaps?.query_results || []).map((r, i) => {
            const strength = r.combined_strength || r.recommendation_strength || 'none'
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))',
                border: '1px solid rgba(244,239,230,0.10)',
                borderRadius: 12, padding: '14px 18px',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: STRENGTH_COLOR[strength],
                  boxShadow: strength === 'strong'
                    ? '0 0 8px rgba(122,208,138,0.5)'
                    : strength === 'none'
                    ? '0 0 8px rgba(255,42,50,0.5)'
                    : 'none',
                }} />
                <span style={{ flex: 1, fontSize: 14, color: '#cdc6ba', lineHeight: 1.45 }}>{r.query}</span>
                <span style={{
                  fontFamily: "'Geist Mono', monospace", fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: '0.10em',
                  padding: '4px 10px', borderRadius: '999px', flexShrink: 0,
                  background: STRENGTH_BG[strength],
                  color: STRENGTH_COLOR[strength],
                  border: `1px solid ${STRENGTH_COLOR[strength]}33`,
                }}>{STRENGTH_LABEL[strength]}</span>
              </div>
            )
          })}
        </div>

        {/* Quick wins */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
          border: '1px solid rgba(244,239,230,0.12)',
          borderRadius: 22, padding: '28px 32px', marginBottom: 32,
        }}>
          <Eyebrow>Quick Wins — Fix These First</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {(gaps?.quick_wins || []).map((w, i) => {
              const action = typeof w === 'string' ? w : w.action
              const layer  = typeof w === 'object' ? w.layer : null
              const impact = typeof w === 'object' ? w.impact : null
              return (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 28, fontWeight: 400, color: '#ff2a32',
                    lineHeight: 1, flexShrink: 0, minWidth: 24,
                  }}>{i + 1}</span>
                  <div style={{ paddingTop: 3 }}>
                    <div style={{ fontSize: 14.5, color: '#f4efe6', lineHeight: 1.55, marginBottom: 6 }}>
                      {action}
                    </div>
                    {layer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: "'Geist Mono', monospace", fontSize: 9.5,
                          textTransform: 'uppercase', letterSpacing: '0.12em',
                          color: '#cdc6ba', padding: '2px 8px', borderRadius: '999px',
                          background: 'rgba(244,239,230,0.06)',
                          border: '1px solid rgba(244,239,230,0.12)',
                        }}>{layer}</span>
                        {impact && (
                          <span style={{ fontSize: 12.5, color: '#8a8378', lineHeight: 1.4 }}>{impact}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <button onClick={onViewPack} style={{
          width: '100%', height: 56,
          background: '#f4efe6', color: '#15110d',
          border: 0, borderRadius: '999px',
          fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 500,
          cursor: 'pointer', letterSpacing: '0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 12px 36px -10px rgba(244,239,230,0.12), 0 1px 0 rgba(255,255,255,0.5) inset',
          transition: 'transform 0.15s',
        }}>
          View My AI Recommendation Pack →
        </button>

      </div>
    </div>
  )
}
