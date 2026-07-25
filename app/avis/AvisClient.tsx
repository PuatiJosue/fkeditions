'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Banner } from '@/components/auth/AuthForm'

interface CommentItem {
  id: string
  content: string
  createdAt: string
  user: { name: string | null; avatar: string | null }
}

interface Props {
  comments: CommentItem[]
  isLogged: boolean
  userName: string | null
}

function initials(name: string | null): string {
  if (!name) return 'FK'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AvisClient({ comments, isLogged, userName }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setMsg({ type: 'success', text: data.message })
      setContent('')
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erreur inattendue' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}
      >
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Vos voix</span>
          <h1 className="section-title">
            Livre <em className="serif-i">d&apos;or</em>
          </h1>
          <p
            style={{
              marginTop: 28,
              color: 'var(--ink-soft)',
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 640,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Lecteurs, auteurs, ami·e·s de la maison — partagez avec nous ce que
            FK Éditions vous inspire. Chaque message est lu avec attention par
            notre équipe avant publication.
          </p>
        </div>
      </section>

      {/* Formulaire */}
      <section className="fk-section" style={{ paddingTop: 0, paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ maxWidth: 720 }}>
          {isLogged ? (
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                padding: 'clamp(24px, 4vw, 36px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 24,
                  color: 'var(--ink)',
                }}
              >
                Laisser un message
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)' }}>
                Vous écrivez en tant que <strong style={{ color: 'var(--accent)' }}>{userName ?? 'Vous'}</strong>.
                Votre message sera affiché après validation par l&apos;équipe.
              </p>

              {msg && <Banner kind={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Banner>}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                minLength={10}
                maxLength={1500}
                placeholder="Partagez votre ressenti, un mot pour les auteurs, une suggestion…"
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  fontSize: 15,
                  padding: '14px 18px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  lineHeight: 1.6,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-soft)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <p style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink-mute)' }}>
                {content.length} / 1500
              </p>
              <button
                type="submit"
                disabled={loading || content.trim().length < 10}
                className="btn btn-primary"
                style={{
                  alignSelf: 'flex-start',
                  opacity: loading || content.trim().length < 10 ? 0.5 : 1,
                  padding: '12px 28px',
                }}
              >
                <span>{loading ? 'Envoi…' : 'Publier le message'}</span>
                <span className="shimmer" />
              </button>
            </form>
          ) : (
            <div
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
                padding: 32,
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: 'var(--ink)',
                  marginBottom: 14,
                }}
              >
                Connectez-vous pour laisser un message
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 22 }}>
                Pour préserver la qualité des échanges, seuls les comptes inscrits
                peuvent contribuer au livre d&apos;or.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                <Link href="/login?callbackUrl=/avis" className="btn btn-primary">
                  <span>Se connecter</span>
                  <span className="shimmer" />
                </Link>
                <Link href="/register" className="btn btn-ghost">
                  Créer un compte
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Liste des commentaires */}
      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container" style={{ maxWidth: 880 }}>
          <div style={{ marginBottom: 32 }}>
            <span className="kicker">Récents</span>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: 'var(--ink)',
                marginTop: 8,
              }}
            >
              {comments.length} message{comments.length > 1 ? 's' : ''}
            </h2>
          </div>

          {comments.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}
              >
                Soyez le premier à écrire
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-mute)' }}>
                Le livre d&apos;or attend votre première contribution.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {comments.map((c) => (
                <article
                  key={c.id}
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    padding: 'clamp(20px, 3vw, 32px)',
                    display: 'flex',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: 18,
                      fontWeight: 600,
                      overflow: 'hidden',
                    }}
                  >
                    {c.user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.user.avatar}
                        alt={c.user.name ?? 'Avatar'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      initials(c.user.name)
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 10,
                        flexWrap: 'wrap',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--serif)',
                          fontSize: 17,
                          color: 'var(--ink)',
                          fontWeight: 600,
                        }}
                      >
                        {c.user.name || 'Anonyme'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                        · {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: 'var(--ink-soft)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {c.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
