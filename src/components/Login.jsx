import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import PetPalsLogo from '@petpals/theme/PetPalsLogo.jsx'
import ThemeToggle from '@petpals/theme/ThemeToggle.jsx'
import { Mail, Lock, Shield, Users, BarChart3 } from 'lucide-react'
import { DEFAULT_LOGIN_EMAIL, DEFAULT_LOGIN_PASSWORD } from '../config/defaultLogin.js'

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState(DEFAULT_LOGIN_EMAIL)
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    onLoginSuccess(data.user)
    setLoading(false)
  }

  return (
    <div
      className="relative flex min-h-screen overflow-hidden"
      style={{ background: 'var(--pp-bg)', color: 'var(--pp-text-primary)' }}
    >
      <div
        className="absolute left-5 top-5 z-20 flex items-center gap-2.5"
        style={{ maxWidth: 'calc(100% - 5rem)' }}
      >
        <PetPalsLogo size="sm" />
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--pp-primary)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          Admin App
        </span>
      </div>

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div
        className="hidden lg:flex w-1/2 flex-col p-12 xl:p-16 pt-24 relative"
        style={{ borderRight: '1px solid var(--pp-card-border)', background: 'var(--pp-sidebar-bg)' }}
      >
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <div
            className="mb-6 inline-flex w-fit items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{
              borderRadius: 99,
              border: '1px solid var(--pp-card-border)',
              background: 'var(--pp-card-bg)',
              color: 'var(--pp-primary)',
            }}
          >
            Admin Console
          </div>
          <h2 className="text-4xl font-black leading-tight mb-6" style={{ color: 'var(--pp-text-primary)' }}>
            Centralized control for the{' '}
            <span style={{ color: 'var(--pp-primary)' }}>PetPals ecosystem</span>
          </h2>
          <ul className="space-y-5" style={{ color: 'var(--pp-text-secondary)' }}>
            <li className="flex items-start gap-4">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--pp-card-bg)', color: 'var(--pp-primary)' }}
              >
                <Users className="w-4 h-4" />
              </div>
              <span>
                <strong style={{ color: 'var(--pp-text-primary)' }}>User & partner management.</strong>{' '}
                Oversee adopters, clinics, shelters, and shops from one dashboard.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--pp-card-bg)', color: 'var(--pp-primary)' }}
              >
                <BarChart3 className="w-4 h-4" />
              </div>
              <span>
                <strong style={{ color: 'var(--pp-text-primary)' }}>Platform analytics.</strong>{' '}
                Monitor pets, orders, campaigns, and community activity in real time.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--pp-card-bg)', color: 'var(--pp-primary)' }}
              >
                <Shield className="w-4 h-4" />
              </div>
              <span>
                <strong style={{ color: 'var(--pp-text-primary)' }}>Secure access.</strong>{' '}
                Restricted to verified administrators with role-based permissions.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 pt-24 relative z-10">
        <div
          className="w-full max-w-md"
          style={{
            background: 'var(--pp-card-bg)',
            borderRadius: 24,
            border: '1px solid var(--pp-card-border)',
            boxShadow: 'var(--pp-shadow-floating)',
            padding: '40px',
          }}
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--pp-text-primary)' }}>
              Administrator sign in
            </h2>
            <p style={{ color: 'var(--pp-text-secondary)', fontSize: 14 }}>
              Access the PetPals platform management console.
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-3 p-4 text-sm mb-6"
              style={{
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FECACA',
                borderRadius: 12,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block mb-2 text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--pp-text-muted)' }}
              >
                Work email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--pp-text-muted)' }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: 12,
                    border: '1.5px solid var(--pp-input-border)',
                    background: 'var(--pp-input-bg)',
                    fontSize: 14,
                    color: 'var(--pp-text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--pp-primary)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--pp-input-border)'
                  }}
                  placeholder="admin@yourorganization.com"
                />
              </div>
            </div>
            <div>
              <label
                className="block mb-2 text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--pp-text-muted)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--pp-text-muted)' }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: 12,
                    border: '1.5px solid var(--pp-input-border)',
                    background: 'var(--pp-input-bg)',
                    fontSize: 14,
                    color: 'var(--pp-text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--pp-primary)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--pp-input-border)'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="pp-login-submit btn-primary w-full py-3.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
