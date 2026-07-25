'use client'

import { useState } from 'react'
import { Banner, Field } from '@/components/auth/AuthForm'

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' }

/** Formulaire de contact autonome (état, envoi et écran de confirmation). */
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  if (sent) {
    return (
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 48, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink)', marginBottom: 12 }}>
          Message envoyé !
        </h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 24, fontSize: 15 }}>
          Merci pour votre message. Nous vous répondrons dans les meilleurs délais.
        </p>
        <button
          onClick={() => { setSent(false); setForm(EMPTY_FORM) }}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: '1px solid currentColor', paddingBottom: 2 }}
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 'clamp(28px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <Banner kind="error">{error}</Banner>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
        <Field label="Nom" type="text" value={form.name} onChange={(v) => update('name', v)} placeholder="Votre nom" required />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="votre@email.com" required />
      </div>

      <Field label="Sujet" type="text" value={form.subject} onChange={(v) => update('subject', v)} placeholder="Objet de votre message" required />

      <div>
        <label style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Message
        </label>
        <textarea
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          required
          rows={7}
          maxLength={2000}
          placeholder="Votre message…"
          style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 15, padding: '14px 18px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', transition: 'border-color 0.3s, box-shadow 0.3s' }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-soft)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--line)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <p style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>
          {form.message.length}/2000
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1, marginTop: 4 }}>
        <span>{loading ? 'Envoi…' : 'Envoyer le message'}</span>
        <span className="shimmer" />
      </button>
    </form>
  )
}
