'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Banner, Field } from '@/components/AuthForm'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="fk-section"
      style={{ minHeight: 'calc(100vh - 240px)', display: 'flex', alignItems: 'center' }}
    >
      <div className="fk-container">
        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="kicker" style={{ justifyContent: 'center' }}>Mot de passe oublié</span>
            <h1 className="section-title" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', marginTop: 16 }}>
              Récupération
            </h1>
            <p style={{ marginTop: 16, color: 'var(--ink-soft)', fontSize: 16 }}>
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              padding: 'clamp(28px, 4vw, 40px)',
            }}
          >
            {sent ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)' }}>
                  Email envoyé !
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  Si un compte existe avec cet email, vous recevrez un lien de
                  réinitialisation valable 1 heure.
                </p>
                <Link
                  href="/login"
                  style={{
                    color: 'var(--accent)',
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    marginTop: 8,
                  }}
                >
                  ← Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && <Banner kind="error">{error}</Banner>}

                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="votre@email.com"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    opacity: loading ? 0.6 : 1,
                    marginTop: 4,
                  }}
                >
                  <span>{loading ? 'Envoi…' : 'Envoyer le lien'}</span>
                  <span className="shimmer" />
                </button>

                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-mute)' }}>
                  <Link
                    href="/login"
                    style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Retour à la connexion
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
