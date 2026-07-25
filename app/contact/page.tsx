'use client'

import { useState } from 'react'
import { Banner, Field } from '@/components/auth/AuthForm'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
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

  return (
    <>
      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}
      >
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Nous contacter</span>
          <h1 className="section-title">
            Échangeons <em className="serif-i">ensemble</em>
          </h1>
          <p
            style={{
              marginTop: 28,
              color: 'var(--ink-soft)',
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Une question, une collaboration ou simplement envie d&apos;échanger ?
            Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 1fr) 2fr',
              gap: 'clamp(40px, 6vw, 80px)',
              alignItems: 'start',
            }}
            className="contact-grid"
          >
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--serif)',
                    fontStyle: 'italic',
                    fontSize: 28,
                    color: 'var(--ink)',
                    marginBottom: 24,
                  }}
                >
                  Nos coordonnées
                </h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <ContactRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                    label="Email"
                  >
                    <a
                      href="mailto:editionsfk@gmail.com"
                      style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      editionsfk@gmail.com
                    </a>
                  </ContactRow>
                  <ContactRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                    label="Téléphone"
                  >
                    <a
                      href="tel:+243829082048"
                      style={{ color: 'var(--ink)', textDecoration: 'none' }}
                    >
                      +243 829 082 048
                    </a>
                  </ContactRow>
                  <ContactRow
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    label="Adresse"
                  >
                    <span style={{ color: 'var(--ink-soft)' }}>Kinshasa, République Démocratique du Congo</span>
                  </ContactRow>
                </ul>
              </div>

              <div style={{ height: 1, background: 'var(--line)' }} />

              <div>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-mute)',
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  Réseaux sociaux
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <SocialIcon href="https://www.facebook.com/fkeditions" label="Facebook">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12z" />
                    </svg>
                  </SocialIcon>
                  <SocialIcon href="https://www.instagram.com/fkeditions" label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                  </SocialIcon>
                  <SocialIcon href="https://whatsapp.com/channel/0029Vb8KostEawdvoq0VyX0S" label="WhatsApp">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.5 3.5A10 10 0 0 0 3.6 16.1L2.1 22l6-1.6A10 10 0 1 0 20.5 3.5z" />
                    </svg>
                  </SocialIcon>
                </div>
              </div>
            </aside>

            {/* Form */}
            <div>
              {sent ? (
                <div
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    padding: 48,
                    textAlign: 'center',
                  }}
                >
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
                      margin: '0 auto 20px',
                    }}
                  >
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
                    onClick={() => {
                      setSent(false)
                      setForm({ name: '', email: '', subject: '', message: '' })
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderBottom: '1px solid currentColor',
                      paddingBottom: 2,
                    }}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
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

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 20,
                    }}
                  >
                    <Field
                      label="Nom"
                      type="text"
                      value={form.name}
                      onChange={(v) => update('name', v)}
                      placeholder="Votre nom"
                      required
                    />
                    <Field
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(v) => update('email', v)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>

                  <Field
                    label="Sujet"
                    type="text"
                    value={form.subject}
                    onChange={(v) => update('subject', v)}
                    placeholder="Objet de votre message"
                    required
                  />

                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-mute)',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      required
                      rows={7}
                      maxLength={2000}
                      placeholder="Votre message…"
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
                    <p
                      style={{
                        textAlign: 'right',
                        fontSize: 11,
                        color: 'var(--ink-mute)',
                        marginTop: 4,
                      }}
                    >
                      {form.message.length}/2000
                    </p>
                  </div>

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
                    <span>{loading ? 'Envoi…' : 'Envoyer le message'}</span>
                    <span className="shimmer" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <li style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {icon}
      </span>
      <div>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        <div style={{ fontSize: 15 }}>{children}</div>
      </div>
    </li>
  )
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        width: 40,
        height: 40,
        border: '1px solid var(--line)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink)',
        textDecoration: 'none',
        transition: 'all 0.3s var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--ink)'
        e.currentTarget.style.color = 'var(--bg)'
        e.currentTarget.style.borderColor = 'var(--ink)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = ''
        e.currentTarget.style.color = 'var(--ink)'
        e.currentTarget.style.borderColor = 'var(--line)'
      }}
    >
      <span style={{ width: 16, height: 16, display: 'flex' }}>{children}</span>
    </a>
  )
}
