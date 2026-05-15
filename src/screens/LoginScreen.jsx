import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginScreen({ onSuccess, onGoToSignup, message }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message === 'Email not confirmed'
        ? 'Please verify your email before logging in. Check your inbox for the verification link.'
        : error.message
      setError(msg)
    } else {
      onSuccess()
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email address first.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif",
            fontSize: 28,
            color: '#FAFAFA',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            Cited
          </div>
        </div>

        {/* Success message from signup */}
        {message && (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 0,
            padding: '12px 16px',
            marginBottom: 20,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#4ade80',
            lineHeight: 1.5,
          }}>
            {message}
          </div>
        )}

        {/* Reset email sent */}
        {resetSent && (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 0,
            padding: '12px 16px',
            marginBottom: 20,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#4ade80',
            lineHeight: 1.5,
          }}>
            Password reset email sent — check your inbox.
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'rgba(244,239,230,0.03)',
          border: '1px solid rgba(244,239,230,0.08)',
          borderRadius: 0,
          padding: '32px 28px',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: '#525252',
            marginBottom: 24,
          }}>
            Sign in
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: '#6b6359',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 8,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(244,239,230,0.04)',
                  border: '1px solid rgba(244,239,230,0.1)',
                  borderRadius: 0,
                  padding: '11px 14px',
                  color: '#FAFAFA',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: '#6b6359',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 8,
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(244,239,230,0.04)',
                  border: '1px solid rgba(244,239,230,0.1)',
                  borderRadius: 0,
                  padding: '11px 14px',
                  color: '#FAFAFA',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#525252',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16,
                padding: '10px 14px',
                background: 'rgba(255,42,50,0.08)',
                border: '1px solid rgba(255,42,50,0.2)',
                borderRadius: 0,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: '#ff6b70',
                lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ff2a32',
                border: 'none',
                borderRadius: 0,
                color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: '#525252',
        }}>
          Don't have an account?{' '}
          <button
            onClick={onGoToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#D4D4D4',
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Create one
          </button>
        </div>

      </div>
    </div>
  )
}
