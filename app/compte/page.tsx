'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PasswordStrength, { isPasswordValid } from '@/components/auth/PasswordStrength'
import { Banner, Field } from '@/components/auth/AuthForm'

interface UserProfile {
  name: string | null
  email: string
  avatar: string | null
}
type Msg = { type: 'ok' | 'err'; text: string }

export default function ComptePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [infoPassword, setInfoPassword] = useState('')
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoMsg, setInfoMsg] = useState<Msg | null>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<Msg | null>(null)

  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<Msg | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (session === null) router.push('/login?callbackUrl=/compte')
  }, [session, router])

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/user/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        setProfile(data)
        setName(data.name ?? '')
        setEmail(data.email ?? '')
      })
      .catch(() => {})
  }, [session])

  if (!session) return null

  const initials = (profile?.name ?? profile?.email ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const emailChanged = profile ? email !== profile.email : false
  const displayAvatar = avatarPreview ?? profile?.avatar ?? null

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarLoading(true)
    setAvatarMsg(null)
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const res = await fetch('/api/user/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile((p) => (p ? { ...p, avatar: data.avatar } : p))
      setAvatarMsg({ type: 'ok', text: 'Photo mise à jour !' })
    } catch (err: unknown) {
      setAvatarMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur inattendue' })
      setAvatarPreview(null)
    } finally {
      setAvatarLoading(false)
    }
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    setInfoLoading(true)
    setInfoMsg(null)
    if (emailChanged && !infoPassword) {
      setInfoMsg({ type: 'err', text: "Entrez votre mot de passe actuel pour changer l'email." })
      setInfoLoading(false)
      return
    }
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: emailChanged ? email : undefined,
          currentPassword: emailChanged ? infoPassword : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile((p) => (p ? { ...p, name: data.name, email: data.email } : p))
      await update({ name: data.name })
      setInfoMsg({ type: 'ok', text: 'Informations mises à jour.' })
      setInfoPassword('')
    } catch (err: unknown) {
      setInfoMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur inattendue' })
    } finally {
      setInfoLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' })
      return
    }
    if (!isPasswordValid(newPw)) {
      setPwMsg({ type: 'err', text: 'Le mot de passe ne respecte pas les critères de sécurité.' })
      return
    }
    setPwLoading(true)
    setPwMsg(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPwMsg({ type: 'ok', text: 'Mot de passe modifié avec succès.' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err: unknown) {
      setPwMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur inattendue' })
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <>
      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(48px, 6vh, 80px)', paddingBottom: 'clamp(32px, 4vh, 48px)' }}
      >
        <div className="fk-container">
          <span className="kicker">Mon espace</span>
          <h1 className="section-title" style={{ marginTop: 16 }}>
            Mon <em className="serif-i">compte</em>
          </h1>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 1fr) 3fr',
              gap: 'clamp(32px, 4vw, 56px)',
              alignItems: 'start',
            }}
            className="compte-grid"
          >
            <aside>
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'relative',
                    width: 96,
                    height: 96,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label="Changer la photo"
                >
                  {displayAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayAvatar}
                      alt="Avatar"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '2px solid var(--line)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'var(--accent-soft)',
                        border: '2px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        fontFamily: 'var(--serif)',
                        fontStyle: 'italic',
                        fontSize: 28,
                        fontWeight: 600,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  {avatarLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          border: '2px solid var(--accent)',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-mute)',
                    fontSize: 11,
                    cursor: 'pointer',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Changer la photo
                </button>
                {avatarMsg && (
                  <p style={{ fontSize: 12, color: avatarMsg.type === 'ok' ? '#16a34a' : '#dc2626' }}>
                    {avatarMsg.text}
                  </p>
                )}
                <div style={{ width: '100%', height: 1, background: 'var(--line)', margin: '8px 0' }} />
                <p style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>
                  {profile?.name || 'Utilisateur'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{profile?.email}</p>
              </div>

              <Link
                href="/bibliotheque"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 4px',
                  color: 'var(--ink-soft)',
                  textDecoration: 'none',
                  fontSize: 13,
                  letterSpacing: '0.05em',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Ma bibliothèque
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-soft)',
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Se déconnecter
              </button>
            </aside>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Info personnelles */}
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  padding: 'clamp(24px, 3vw, 36px)',
                }}
              >
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 24 }}>
                  Informations personnelles
                </h2>
                <form
                  onSubmit={handleInfoSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}
                >
                  <Field label="Nom affiché" type="text" value={name} onChange={setName} required />
                  <Field label="Adresse email" type="email" value={email} onChange={setEmail} required />
                  {emailChanged && (
                    <>
                      <p style={{ fontSize: 12, color: 'var(--accent)' }}>
                        Vous modifiez votre email — un mot de passe est requis.
                      </p>
                      <Field
                        label="Mot de passe actuel"
                        type="password"
                        value={infoPassword}
                        onChange={setInfoPassword}
                        placeholder="••••••••"
                        required
                      />
                    </>
                  )}
                  {infoMsg && <Banner kind={infoMsg.type === 'ok' ? 'success' : 'error'}>{infoMsg.text}</Banner>}
                  <button
                    type="submit"
                    disabled={infoLoading}
                    className="btn btn-primary"
                    style={{
                      alignSelf: 'flex-start',
                      opacity: infoLoading ? 0.6 : 1,
                      padding: '12px 28px',
                    }}
                  >
                    <span>{infoLoading ? 'Enregistrement…' : 'Enregistrer'}</span>
                    <span className="shimmer" />
                  </button>
                </form>
              </div>

              {/* Mot de passe */}
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  padding: 'clamp(24px, 3vw, 36px)',
                }}
              >
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 6 }}>
                  Changer le mot de passe
                </h2>
                <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 24 }}>
                  Pour votre sécurité, choisissez un mot de passe difficile à deviner.
                </p>
                <form
                  onSubmit={handlePasswordSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}
                >
                  <Field
                    label="Mot de passe actuel"
                    type="password"
                    value={currentPw}
                    onChange={setCurrentPw}
                    placeholder="••••••••"
                    required
                  />
                  <div>
                    <Field
                      label="Nouveau mot de passe"
                      type={showNewPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={setNewPw}
                      placeholder="Créez un mot de passe sécurisé"
                      required
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowNewPw((v) => !v)}
                          tabIndex={-1}
                          style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer', padding: 4, display: 'flex' }}
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            {showNewPw ? (
                              <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <>
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                      }
                    />
                    <PasswordStrength password={newPw} />
                  </div>
                  <Field
                    label="Confirmer le nouveau mot de passe"
                    type="password"
                    value={confirmPw}
                    onChange={setConfirmPw}
                    placeholder="••••••••"
                    required
                  />
                  {confirmPw && (
                    <p
                      style={{
                        fontSize: 12,
                        color: confirmPw === newPw ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {confirmPw === newPw ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                    </p>
                  )}
                  {pwMsg && <Banner kind={pwMsg.type === 'ok' ? 'success' : 'error'}>{pwMsg.text}</Banner>}
                  <button
                    type="submit"
                    disabled={pwLoading || !isPasswordValid(newPw) || newPw !== confirmPw}
                    className="btn btn-primary"
                    style={{
                      alignSelf: 'flex-start',
                      opacity: pwLoading || !isPasswordValid(newPw) || newPw !== confirmPw ? 0.4 : 1,
                      padding: '12px 28px',
                    }}
                  >
                    <span>{pwLoading ? 'Modification…' : 'Modifier le mot de passe'}</span>
                    <span className="shimmer" />
                  </button>
                  {newPw && !isPasswordValid(newPw) && (
                    <p style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                      Respectez tous les critères obligatoires pour activer le bouton.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 880px) {
          .compte-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
