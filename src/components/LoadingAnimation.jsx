import React from 'react'

function buildSteps(country) {
  const suffix = country ? ` for ${country}` : ''
  return [
    'Reading your company...',
    `Identifying buyer queries${suffix}...`,
    'Running live AI queries...',
    `Analyzing recommendation gaps${suffix}...`,
    `Generating AI recommendation pack${suffix}...`,
  ]
}

export default function LoadingAnimation({ currentStep, country }) {
  const STEPS = buildSteps(country)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 40, padding: '2rem',
      position: 'relative',
      background: `
        radial-gradient(900px 600px at 50% 40%, rgba(255,42,50,0.05) 0%, transparent 65%),
        linear-gradient(180deg, #0a0907 0%, #100e0b 60%, #0a0907 100%)
      `,
    }}>

      {/* Aperture spinner */}
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        {/* Outer ring - spins */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1px solid rgba(244,239,230,0.08)',
          animation: 'spin 2.8s linear infinite',
        }} />
        {/* Middle ring */}
        <div style={{
          position: 'absolute', inset: 12, borderRadius: '50%',
          border: '1px solid rgba(244,239,230,0.12)',
          animation: 'spin 2s linear infinite reverse',
        }} />
        {/* Inner red glow dot */}
        <div style={{
          position: 'absolute', inset: '50%',
          transform: 'translate(-50%, -50%)',
          width: 12, height: 12, borderRadius: '50%',
          background: '#ff2a32',
          boxShadow: '0 0 24px rgba(255,42,50,0.60), 0 0 8px rgba(255,42,50,0.90)',
          animation: 'pulse-ring 2s ease-out infinite',
        }} />
      </div>

      {/* Current step text */}
      <div style={{
        fontFamily: "'Geist Mono', monospace", fontSize: 13,
        color: '#ff2a32', letterSpacing: '0.04em',
        textAlign: 'center', minHeight: '1.5rem',
      }}>
        {STEPS[currentStep] || 'Processing...'}
      </div>

      {/* Steps list */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        maxWidth: 400, width: '100%',
        padding: '24px 28px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
        border: '1px solid rgba(244,239,230,0.10)',
        borderRadius: 22,
      }}>
        {STEPS.map((step, i) => {
          const isDone   = i < currentStep
          const isActive = i === currentStep
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'opacity 0.3s',
              opacity: isDone ? 0.5 : 1,
            }}>
              {/* Status dot */}
              <div style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: isDone   ? '#7ad08a'
                           : isActive ? '#ff2a32'
                           :            '#544e46',
                boxShadow: isActive ? '0 0 10px rgba(255,42,50,0.60)' : 'none',
                animation: isActive ? 'pulse-ring 2s ease-out infinite' : 'none',
                transition: 'background 0.3s, box-shadow 0.3s',
              }} />

              {/* Step label */}
              <span style={{
                fontFamily: "'Geist Mono', monospace", fontSize: 12,
                letterSpacing: '0.02em', lineHeight: 1.45,
                color: isDone   ? '#7ad08a'
                      : isActive ? '#f4efe6'
                      :            '#544e46',
                transition: 'color 0.3s',
              }}>
                {step}
              </span>

              {/* Done check */}
              {isDone && (
                <span style={{
                  marginLeft: 'auto', flexShrink: 0,
                  fontFamily: "'Geist Mono', monospace", fontSize: 10,
                  color: '#7ad08a',
                }}>✓</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Footnote */}
      <div style={{
        fontFamily: "'Geist Mono', monospace", fontSize: 11,
        color: '#544e46', textTransform: 'uppercase', letterSpacing: '0.14em',
        textAlign: 'center',
      }}>
        Querying ChatGPT · Perplexity · Gemini · Claude · Google AI
      </div>

    </div>
  )
}
