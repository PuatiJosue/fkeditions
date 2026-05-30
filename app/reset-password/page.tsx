'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Banner, Field } from '@/components/AuthForm'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/login?reset=1')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Banner kind="error">Lien invalide ou manquant.</Banner>
        <Link
          href="/forgot-password"
          style={{
            color: 'var(--accent)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            marginTop: 8,
          }}
        >
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <Banner kind="error">{error}</Banner>}

      <Field
        label="Nouveau mot de passe"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Min. 8 caractères"
        required
      />

      <Field
        label="Confirmer le mot de passe"
        type="password"
        value={confirm}
        onChange={setConfirm}
        placeholder="••••••••"
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
        <span>{loading ? 'Enregistrement…' : 'Réinitialiser'}</span>
        <span className="shimmer" />
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <section
      className="fk-section"
      style={{ minHeight: 'calc(100vh - 240px)', display: 'flex', alignItems: 'center' }}
    >
      <div className="fk-container">
        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="kicker" style={{ justifyContent: 'center' }}>Sécurité</span>
            <h1 className="section-title" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', marginTop: 16 }}>
              Nouveau <em className="serif-i">mot de passe</em>
            </h1>
            <p style={{ marginTop: 16, color: 'var(--ink-soft)', fontSize: 16 }}>
              Choisissez un nouveau mot de passe sécurisé.
            </p>
          </div>

          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              padding: 'clamp(28px, 4vw, 40px)',
            }}
          >
            <Suspense>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
