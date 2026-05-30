'use client'

import { useState } from 'react'

interface CommentRow {
  id: string
  content: string
  approved: boolean
  createdAt: string
  user: { id: string; name: string | null; email: string; avatar: string | null }
}

export default function AvisModerationClient({ initial }: { initial: CommentRow[] }) {
  const [comments, setComments] = useState<CommentRow[]>(initial)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = comments.filter((c) => {
    if (filter === 'pending') return !c.approved
    if (filter === 'approved') return c.approved
    return true
  })

  const pendingCount = comments.filter((c) => !c.approved).length

  async function toggle(id: string, approved: boolean) {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      if (res.ok) {
        setComments((cs) => cs.map((c) => (c.id === id ? { ...c, approved } : c)))
      }
    } finally {
      setBusy(null)
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer définitivement ce commentaire ?')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setComments((cs) => cs.filter((c) => c.id !== id))
      }
    } finally {
      setBusy(null)
    }
  }

  async function blockAuthor(userId: string, userEmail: string) {
    const reason = prompt(
      `Bloquer ${userEmail} ?\n\nRaison (optionnelle) — visible dans l'admin :`,
      'Commentaire irrespectueux dans le livre d\'or'
    )
    if (reason === null) return
    setBusy(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Erreur')
        return
      }
      alert(`${userEmail} a été bloqué. Ses commentaires sont automatiquement masqués.`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <span className="kicker">Modération</span>
        <h1 className="admin-page-title" style={{ marginTop: 12 }}>
          Livre <em className="serif-i" style={{ color: 'var(--accent)' }}>d&apos;or</em>
        </h1>
        <p className="admin-page-subtitle">
          {pendingCount > 0
            ? `${pendingCount} commentaire${pendingCount > 1 ? 's' : ''} en attente de validation`
            : 'Aucun commentaire à modérer'}
        </p>
      </div>

      <div className="section-tabs" style={{ marginTop: 0, marginBottom: 24 }}>
        <button
          className={`tab ${filter === 'pending' ? 'is-active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          À valider ({pendingCount})
        </button>
        <button
          className={`tab ${filter === 'approved' ? 'is-active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Publiés ({comments.length - pendingCount})
        </button>
        <button
          className={`tab ${filter === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous ({comments.length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div
          className="admin-card"
          style={{ textAlign: 'center', padding: 48, color: 'var(--ink-mute)' }}
        >
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)' }}>
            Rien à afficher dans cette catégorie
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((c) => (
            <article
              key={c.id}
              className="admin-card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 16,
                alignItems: 'start',
                borderLeft: c.approved ? '3px solid #16a34a' : '3px solid #ea580c',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  fontWeight: 600,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {c.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.user.avatar}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (c.user.name ?? c.user.email)
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((s) => s[0])
                    .join('')
                    .toUpperCase()
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    {c.user.name || c.user.email}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>· {c.user.email}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                    · {new Date(c.createdAt).toLocaleString('fr-FR')}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      background: c.approved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 88, 12, 0.1)',
                      color: c.approved ? '#16a34a' : '#ea580c',
                      border: `1px solid ${c.approved ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 88, 12, 0.3)'}`,
                    }}
                  >
                    {c.approved ? 'Publié' : 'En attente'}
                  </span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>
                  {c.content}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {!c.approved ? (
                  <button
                    onClick={() => toggle(c.id, true)}
                    disabled={busy === c.id}
                    style={{
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 14px',
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: busy === c.id ? 0.5 : 1,
                    }}
                  >
                    ✓ Approuver
                  </button>
                ) : (
                  <button
                    onClick={() => toggle(c.id, false)}
                    disabled={busy === c.id}
                    style={{
                      background: 'var(--bg-elev)',
                      color: '#ea580c',
                      border: '1px solid #ea580c',
                      padding: '8px 14px',
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: busy === c.id ? 0.5 : 1,
                    }}
                  >
                    ↺ Dépublier
                  </button>
                )}
                <button
                  onClick={() => remove(c.id)}
                  disabled={busy === c.id}
                  style={{
                    background: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    padding: '8px 14px',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: busy === c.id ? 0.5 : 1,
                  }}
                >
                  🗑 Supprimer
                </button>
                <button
                  onClick={() => blockAuthor(c.user.id, c.user.email)}
                  disabled={busy === c.user.id}
                  style={{
                    background: 'transparent',
                    color: '#ea580c',
                    border: '1px solid #ea580c',
                    padding: '8px 14px',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: busy === c.user.id ? 0.5 : 1,
                  }}
                  title="Bloque l'utilisateur (il ne pourra plus se connecter ni commenter)"
                >
                  🚫 Bloquer auteur
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
