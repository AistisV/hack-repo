import React, { useState, useEffect } from 'react'
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

  const runScan = async (input, country = null) => {
    setTargetUrl(input)
    setScreen('scan')
    setReportData(null)
    setContentPack(null)
    setLoadingStep(0)
    setError(null)
    setSelectedCountry(country || null)

    try {
      // Step 1 — Company Intelligence
      const webContext = await searchWeb(input)
      const raw1 = await callClaude(buildPrompt1(input, country, webContext))
      const profile = parseJSON(raw1)
      if (!profile) throw new Error('Could not parse company profile')
      setCompanyName(profile.company_name || input)

      // Step 2 — Buyer Queries
      setLoadingStep(1)
      const raw2 = await callClaude(buildPrompt2(profile, country))
      const queries = parseJSON(raw2)
      if (!queries) throw new Error('Could not parse buyer queries')

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
      const gaps = parseJSON(raw3)
      if (!gaps) throw new Error('Could not parse gap analysis')

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
      gaps.combined_score = webScore != null
        ? Math.round(llmScore * 0.65 + webScore * 0.35)
        : llmScore

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
      <SignupScreen
        onSuccess={(msg) => { setAuthMessage(msg); setScreen('login') }}
        onGoToLogin={() => setScreen('login')}
      />
    )
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        message={authMessage}
        onSuccess={() => { setAuthMessage(null); setScreen('landing') }}
        onGoToSignup={() => setScreen('signup')}
      />
    )
  }

  if (screen === 'landing') {
    return <Screen1_Landing onSubmit={runScan} error={error} onLogout={handleLogout} session={session} onGoToLogin={() => setScreen('login')} />
  }

  if (screen === 'scan') {
    return (
      <Screen_Scan
        url={targetUrl}
        companyName={companyName}
        reportData={reportData}
        contentPack={contentPack}
        loadingStep={loadingStep}
        session={session}
        onBack={resetToLanding}
        onGoToSignup={() => setScreen('signup')}
      />
    )
  }

  return null
}
