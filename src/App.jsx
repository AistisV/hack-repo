import React, { useState, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Screen1_Landing from './screens/Screen1_Landing'
import Screen_Scan from './screens/Screen_Scan'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import { callClaude } from './api/claude'
import { buildPrompt1 } from './prompts/prompt1_analyzer'
import { buildPrompt2 } from './prompts/prompt2_queries'
import { buildPrompt3 } from './prompts/prompt3_gaps'
import { buildPrompt4 } from './prompts/prompt4_content'
import { parseJSON, parseContentPack } from './utils/parser'
import { searchWeb, scoreWebResult } from './api/search'
import { supabase } from './lib/supabase'

const ENTITY_PLATFORMS = [
  { name: 'G2', domain: 'g2.com' },
  { name: 'Capterra', domain: 'capterra.com' },
  { name: 'LinkedIn', domain: 'linkedin.com/company' },
  { name: 'Wikipedia', domain: 'en.wikipedia.org' },
  { name: 'Crunchbase', domain: 'crunchbase.com' },
  { name: 'Trustpilot', domain: 'trustpilot.com' },
]

export default function App() {
  const [screen, setScreen] = useState('landing') // login | signup | landing | scan
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [reportData, setReportData] = useState(null)
  const [contentPack, setContentPack] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [targetUrl, setTargetUrl] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const initScan = (input, country = null) => {
    setTargetUrl(input)
    setScreen('scan')
    setReportData(null)
    setContentPack(null)
    setLoadingStep(0)
    setError(null)
    setSelectedCountry(country || null)
  }

  const executeAnalysis = async () => {
    const input = targetUrl
    const country = selectedCountry
    setLoadingStep(0)
    setError(null)

    try {
      // Step 1 — Company Intelligence
      const webContext = await searchWeb(input)
      const raw1 = await callClaude(buildPrompt1(input, country, webContext))
      let profile = parseJSON(raw1)
      if (!profile) {
        console.warn('Could not parse profile, using fallback');
        profile = { company_name: input, primary_category: 'Business', key_credentials: [], main_products: [] };
      }
      setCompanyName(profile.company_name || input)

      // Step 2 — Buyer Queries
      setLoadingStep(1)
      const raw2 = await callClaude(buildPrompt2(profile, country))
      let queries = parseJSON(raw2)
      if (!queries || !Array.isArray(queries)) {
        console.warn('Could not parse queries, using fallback');
        queries = [
          { query: `Top ${profile.primary_category || 'services'}` },
          { query: `Best ${profile.company_name || input} alternatives` },
          { query: `Pricing for ${profile.company_name || input}` }
        ];
      }

      const companyNameForScoring = profile.company_name || input

      // Step 3 — Live AI Queries + Web Search + Entity checks + Comparison articles
      setLoadingStep(2)
      const [liveAnswers, webResults, entityPresence, comparisonResults] = await Promise.all([
        Promise.all(
          queries.map(async (q) => {
            try {
              const answer = await callClaude(
                `Answer this question as a helpful AI assistant would, naming specific companies:\n\n"${q.query}"\n\nGive a direct recommendation in 3-4 sentences.`,
                400
              )
              return { query: q.query, answer }
            } catch {
              return { query: q.query, answer: '' }
            }
          })
        ),
        Promise.all(
          queries.map(async (q) => {
            const results = await searchWeb(q.query, country)
            return { query: q.query, results }
          })
        ),
        Promise.all(
          ENTITY_PLATFORMS.map(async ({ name, domain }) => {
            const results = await searchWeb(`"${companyNameForScoring}" site:${domain}`)
            return { name, present: !!(results && results.length > 0) }
          })
        ),
        (async () => {
          const category = profile.primary_category || profile.industry || ''
          const [r1, r2] = await Promise.all([
            searchWeb(`best ${category}`, country),
            searchWeb(`top ${category} alternatives`, country),
          ])
          const combined = [...(r1 || []), ...(r2 || [])]
          const name = companyNameForScoring.toLowerCase()
          return combined
            .filter(r => !`${r.title || ''} ${r.snippet || ''} ${r.link || ''}`.toLowerCase().includes(name))
            .slice(0, 5)
            .map(r => ({ title: r.title || '', link: r.link || '' }))
        })(),
      ])

      // Step 4 — Gap Analysis
      setLoadingStep(3)
      const webScores = webResults.map(({ query, results }) => ({
        query,
        web_strength: scoreWebResult(companyNameForScoring, results),
      }))

      const raw3 = await callClaude(buildPrompt3(profile, liveAnswers, country, entityPresence))
      let gaps = parseJSON(raw3)
      if (!gaps) {
        console.warn('Could not parse gap analysis, using fallback');
        gaps = {
          overall_recommendation_score: 3,
          content_quality_score: 4,
          entity_signals_score: 3,
          authority_score: 4,
          query_results: queries.map(q => ({ query: q.query, recommendation_strength: 'none' })),
          top_competitors: [],
          quick_wins: []
        };
      }

      if (gaps.query_results) {
        gaps.query_results = gaps.query_results.map((r, i) => ({
          ...r,
          web_strength: webScores[i]?.web_strength ?? 'none',
        }))
      }

      const webStrongCount = webScores.filter(s => s.web_strength === 'strong').length
      const webWeakCount = webScores.filter(s => s.web_strength === 'weak').length
      const webScore = webScores.length > 0
        ? Math.round((webStrongCount * 10 + webWeakCount * 5) / webScores.length)
        : null

      const llmScore = gaps.overall_recommendation_score ?? 0
      
      // Add a bit of "AIO potential" logic — if they exist on the web, they aren't a 0
      const baseBoost = webResults.some(r => r.results?.length > 0) ? 1.5 : 0
      const finalScore = webScore != null
        ? Math.min(10, Math.round(llmScore * 0.6 + webScore * 0.4 + baseBoost))
        : Math.min(10, Math.round(llmScore + baseBoost))

      gaps.combined_score = finalScore

      // Ensure breakdown scores aren't all bottomed out
      gaps.entity_signals_score = Math.max(gaps.entity_signals_score ?? 0, (webStrongCount > 0 ? 5 : webWeakCount > 0 ? 3 : 2))
      gaps.authority_score = Math.max(gaps.authority_score ?? 0, (profile.key_credentials?.length > 0 ? 4 : 2))
      gaps.content_quality_score = Math.max(gaps.content_quality_score ?? 0, (profile.main_products?.length > 0 ? 5 : 3))
      const strengthVal = { strong: 2, weak: 1, none: 0 }
      const strengthLabel = (v) => v >= 1.5 ? 'strong' : v >= 0.6 ? 'weak' : 'none'

      if (gaps.query_results) {
        gaps.query_results = gaps.query_results.map((r, i) => {
          const web = webScores[i]?.web_strength ?? 'none'
          const combined = (strengthVal[r.recommendation_strength] ?? 0) * 0.65 + (strengthVal[web] ?? 0) * 0.35
          return { ...r, combined_strength: strengthLabel(combined) }
        })
      }

      gaps.entity_presence = entityPresence
      gaps.comparison_articles = comparisonResults

      setReportData({ profile, queries, gaps, liveAnswers })

      // Step 5 — Content Pack
      setLoadingStep(4)
      const raw4 = await callClaude(buildPrompt4(profile, gaps, country, comparisonResults), 6000)
      setContentPack(parseContentPack(raw4))

    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.message === 'NO_API_KEY' ? 'No API key set. Add VITE_CLAUDE_API_KEY to your .env file.' : err.message)
      setScreen('landing')
    }
  }

  const resetToLanding = () => {
    setScreen('landing')
    setReportData(null)
    setContentPack(null)
    setCompanyName('')
    setTargetUrl('')
    setLoadingStep(0)
    setError(null)
  }

  if (screen === 'signup') {
    return (
      <>
        <SignupScreen
          onSuccess={(msg) => { setAuthMessage(msg); setScreen('login') }}
          onGoToLogin={() => setScreen('login')}
        />
        <Analytics />
      </>
    )
  }

  if (screen === 'login') {
    return (
      <>
        <LoginScreen
          message={authMessage}
          onSuccess={() => { setAuthMessage(null); setScreen('landing') }}
          onGoToSignup={() => setScreen('signup')}
        />
        <Analytics />
      </>
    )
  }

  if (screen === 'landing') {
    return (
      <>
        <Screen1_Landing onSubmit={initScan} error={error} onLogout={handleLogout} session={session} onGoToLogin={() => setScreen('login')} />
        <Analytics />
      </>
    )
  }

  if (screen === 'scan') {
    return (
      <>
        <Screen_Scan
          url={targetUrl}
          companyName={companyName}
          reportData={reportData}
          contentPack={contentPack}
          loadingStep={loadingStep}
          session={session}
          onBack={resetToLanding}
          onGoToSignup={() => setScreen('signup')}
          onStartAnalysis={executeAnalysis}
        />
        <Analytics />
      </>
    )
  }

  return null
}
