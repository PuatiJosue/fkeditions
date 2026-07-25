'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Banner, Field } from '@/components/auth/AuthForm'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const registered = searchParams.get('registered') === '1'
  const reset = searchParams.get('reset') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      if (result.error === 'ALREADY_CONNECTED') {
        setError(
          "Vous êtes déjà connecté sur un autre appareil. Déconnectez-vous d'abord pour accéder depuis cet appareil."
        )
      } else if (result.error === 'ACCOUNT_BLOCKED') {
        setError(
          "Votre compte a été suspendu pour non-respect des règles de la communauté. Contactez-nous à editionsfk@gmail.com si vous pensez qu'il s'agit d'une erreur."
        )
      } else if (result.error === 'ACCOUNT_DELETED') {
        setError(
          "Ce compte a été désactivé. Si vous souhaitez le réactiver, contactez-nous à editionsfk@gmail.com."
        )
      } else {
        setError('Email ou mot de passe incorrect')
      }
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <section className="fk-section" style={{ minHeight: 'calc(100vh - 240px)', display: 'flex', alignItems: 'center' }}>
      <div className="fk-container">
        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="kicker" style={{ justifyContent: 'center' }}>Espace lecteur</span>
            <h1
              className="section-title"
              style={{ fontSize: 'clamp(40px, 5vw, 60px)', marginTop: 16 }}
            >
              Connexion
            </h1>
            <p style={{ marginTop: 16, color: 'var(--ink-soft)', fontSize: 16 }}>
              Connectez-vous pour accéder à votre bibliothèque.
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
            {registered && (
              <Banner kind="success">
                Compte créé avec succès ! Connectez-vous.
              </Banner>
            )}
            {reset && (
              <Banner kind="success">
                Mot de passe réinitialisé ! Connectez-vous avec votre nouveau mot de passe.
              </Banner>
            )}
            {error && <Banner kind="error">{error}</Banner>}

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="votre@email.com"
              required
            />

            <Field
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
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
              <span>{loading ? 'Connexion…' : 'Se connecter'}</span>
              <span className="shimmer" />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <Link
                href="/forgot-password"
                style={{ fontSize: 13, color: 'var(--ink-mute)', textDecoration: 'none' }}
              >
                Mot de passe oublié&nbsp;?
              </Link>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)' }}>
                Pas encore de compte ?{' '}
                <Link
                  href="/register"
                  style={{
                    color: 'var(--accent)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderBottom: '1px solid currentColor',
                  }}
                >
                  S&apos;inscrire
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
