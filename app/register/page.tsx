'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Banner, Field } from '@/components/AuthForm'

function getStrength(password: string): { score: number; label: string; color: string } {
  if (password.length === 0) return { score: 0, label: '', color: 'var(--line)' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Faible', color: '#dc2626' }
  if (score <= 3) return { score, label: 'Moyen', color: '#ea580c' }
  return { score, label: 'Fort', color: '#16a34a' }
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getStrength(form.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'inscription")
      setLoading(false)
    } else {
      router.push('/login?registered=1')
    }
  }

  return (
    <section className="fk-section" style={{ minHeight: 'calc(100vh - 240px)', display: 'flex', alignItems: 'center' }}>
      <div className="fk-container">
        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="kicker" style={{ justifyContent: 'center' }}>Rejoignez FK Éditions</span>
            <h1 className="section-title" style={{ fontSize: 'clamp(40px, 5vw, 60px)', marginTop: 16 }}>
              Inscription
            </h1>
            <p style={{ marginTop: 16, color: 'var(--ink-soft)', fontSize: 16 }}>
              Créez votre compte pour acheter et lire en ligne.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              padding: 'clamp(28px, 4vw, 40px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {error && <Banner kind="error">{error}</Banner>}

            <Field
              label="Nom complet"
              type="text"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="Fortune Khonde"
              required
            />

            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="votre@email.com"
              required
            />

            <div>
              <Field
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                placeholder="••••••••"
                required
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-mute)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                    }}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />

              {form.password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 3,
                          flex: 1,
                          borderRadius: 999,
                          background: i <= strength.score ? strength.color : 'var(--line)',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      marginTop: 6,
                      color: strength.color,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {strength.label}
                    {strength.score <= 1 && ' — ajoutez des majuscules, chiffres et symboles'}
                    {strength.score === 2 && ' — ajoutez des majuscules ou symboles'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                opacity: loading ? 0.6 : 1,
                marginTop: 8,
              }}
            >
              <span>{loading ? 'Création…' : 'Créer mon compte'}</span>
              <span className="shimmer" />
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-mute)' }}>
              Déjà un compte ?{' '}
              <Link
                href="/login"
                style={{
                  color: 'var(--accent)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderBottom: '1px solid currentColor',
                }}
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
