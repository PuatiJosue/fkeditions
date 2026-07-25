'use client'

import { useState } from 'react'
import { Banner } from '@/components/auth/AuthForm'

/** Formulaire de dépôt d'un message (réservé aux membres connectés). */
export default function MessageForm({ userName }: { userName: string | null }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const tooShort = content.trim().length < 10

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
    <form onSubmit={handleSubmit} style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 'clamp(24px, 4vw, 36px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, color: 'var(--ink)' }}>
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
        style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 15, padding: '14px 18px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.3s, box-shadow 0.3s' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-soft)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--line)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      <p style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink-mute)' }}>{content.length} / 1500</p>
      <button type="submit" disabled={loading || tooShort} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: loading || tooShort ? 0.5 : 1, padding: '12px 28px' }}>
        <span>{loading ? 'Envoi…' : 'Publier le message'}</span>
        <span className="shimmer" />
      </button>
    </form>
  )
}
