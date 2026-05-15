import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignupScreen({ onSuccess, onGoToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validatePassword = (val) => {
    if (val.length > 0 && val.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
    } else {
      setPasswordError(null)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
      },
    })
    if (error) {
      setError(error.message)
    } else {
      onSuccess('Account created! Check your email to verify your address before signing in.')
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
          <img src="/logo.svg" alt="Cited" style={{ height: 28, width: 'auto', display: 'inline-block' }} />
        </div>

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
            Create account
          </div>

          <form onSubmit={handleSignup}>
            {/* Full name */}
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
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Jane Smith"
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
            <div style={{ marginBottom: 24 }}>
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
                onChange={e => { setPassword(e.target.value); validatePassword(e.target.value) }}
                required
                placeholder="At least 8 characters"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(244,239,230,0.04)',
                  border: `1px solid ${passwordError ? 'rgba(255,42,50,0.4)' : 'rgba(244,239,230,0.1)'}`,
                  borderRadius: 0,
                  padding: '11px 14px',
                  color: '#FAFAFA',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              {passwordError && (
                <div style={{
                  marginTop: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#ff6b70',
                }}>
                  {passwordError}
                </div>
              )}
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: '#525252',
        }}>
          Already have an account?{' '}
          <button
            onClick={onGoToLogin}
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
            Sign in
          </button>
        </div>

      </div>
    </div>
  )
}
