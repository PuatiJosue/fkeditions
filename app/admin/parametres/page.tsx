'use client'

import { useState, useEffect } from 'react'
import { SETTING_DEFAULTS, type SiteSettings } from '@/lib/settings'

type Settings = Partial<SiteSettings>

const SECTIONS: Array<{
  title: string
  description?: string
  fields: Array<{ key: keyof SiteSettings; label: string; placeholder?: string; type?: string; hint?: string }>
}> = [
  {
    title: 'Mobile Money',
    description: 'Numéros où les clients envoient leurs paiements Mobile Money.',
    fields: [
      { key: 'mpesa_number', label: 'Numéro M-Pesa', placeholder: '0829082048', hint: 'Sans indicatif pays (format local)' },
      { key: 'airtel_number', label: 'Numéro Airtel Money', placeholder: '0991316128', hint: 'Sans indicatif pays' },
    ],
  },
  {
    title: 'Coordonnées générales',
    description: 'Email, téléphone et adresse affichés dans le footer et la page contact.',
    fields: [
      { key: 'contact_email', label: 'Email', placeholder: 'editionsfk@gmail.com', type: 'email' },
      { key: 'contact_phone', label: 'Téléphone', placeholder: '+243 829 082 048' },
      { key: 'contact_address', label: 'Adresse complète', placeholder: 'Kinshasa, République Démocratique du Congo' },
      { key: 'contact_city_short', label: 'Adresse courte', placeholder: 'Kinshasa, RDC', hint: 'Pour le footer' },
    ],
  },
  {
    title: 'Réseaux sociaux',
    description: 'URLs complètes (https://...) des comptes officiels.',
    fields: [
      { key: 'social_facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/fkeditions', type: 'url' },
      { key: 'social_instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/fkeditions', type: 'url' },
      { key: 'social_whatsapp_channel', label: 'Canal WhatsApp', placeholder: 'https://whatsapp.com/channel/...', type: 'url' },
      { key: 'social_messenger', label: 'Messenger', placeholder: 'https://m.me/fkeditions', type: 'url' },
    ],
  },
  {
    title: 'Contenu du site',
    description: 'Messages et textes qui apparaissent sur la home.',
    fields: [
      { key: 'topbar_message', label: 'Bandeau supérieur', placeholder: "Maison d'édition…", hint: 'Affiché tout en haut du site' },
      { key: 'hero_kicker', label: 'Pré-titre du héros', placeholder: 'À la une' },
      { key: 'footer_about', label: 'Texte du footer', hint: 'Présentation courte sous le logo dans le footer' },
    ],
  },
  {
    title: 'Prix abonnements Revue',
    description: "Prix USD pour chaque durée d'abonnement.",
    fields: [
      { key: 'plan_1m_price', label: '1 mois', placeholder: '4', type: 'number' },
      { key: 'plan_3m_price', label: '3 mois', placeholder: '8', type: 'number' },
      { key: 'plan_6m_price', label: '6 mois', placeholder: '16', type: 'number' },
      { key: 'plan_12m_price', label: '12 mois', placeholder: '20', type: 'number' },
    ],
  },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  color: 'var(--ink)',
  fontSize: 14,
  padding: '10px 14px',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical',
  transition: 'border-color 0.3s',
}

export default function ParametresPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function update(key: keyof SiteSettings, value: string) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Erreur de sauvegarde')
      setMsg({ type: 'success', text: 'Paramètres enregistrés avec succès.' })
      setTimeout(() => setMsg(null), 4000)
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erreur inattendue' })
    } finally {
      setSaving(false)
    }
  }

  function resetField(key: keyof SiteSettings) {
    update(key, SETTING_DEFAULTS[key] as string)
  }

  if (loading) {
    return (
      <div>
        <h1 className="admin-page-title">Paramètres</h1>
        <p className="admin-page-subtitle">Chargement…</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <span className="kicker">Configuration</span>
        <h1 className="admin-page-title" style={{ marginTop: 12 }}>
          Paramètres du <em className="serif-i" style={{ color: 'var(--accent)' }}>site</em>
        </h1>
        <p className="admin-page-subtitle">
          Modifier les informations affichées sur le site sans toucher au code.
        </p>
      </div>

      {msg && (
        <div
          style={{
            marginBottom: 24,
            padding: '12px 16px',
            background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(220, 38, 38, 0.08)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
            color: msg.type === 'success' ? '#16a34a' : '#dc2626',
            fontSize: 14,
          }}
        >
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="admin-card"
            style={{ padding: 'clamp(20px, 3vw, 28px)' }}
          >
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 22,
                color: 'var(--ink)',
                marginBottom: 4,
              }}
            >
              {section.title}
            </h2>
            {section.description && (
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 20 }}>
                {section.description}
              </p>
            )}
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {section.fields.map((field) => {
                const current = settings[field.key] ?? ''
                const isLong = field.key === 'footer_about' || field.key === 'contact_address' || field.key === 'topbar_message'
                return (
                  <div key={field.key} style={{ gridColumn: isLong ? '1 / -1' : undefined }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 6,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-mute)',
                          fontWeight: 600,
                        }}
                      >
                        {field.label}
                      </label>
                      <button
                        type="button"
                        onClick={() => resetField(field.key)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent)',
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                        title="Restaurer la valeur par défaut"
                      >
                        ↺ Défaut
                      </button>
                    </div>
                    {isLong ? (
                      <textarea
                        value={current}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={2}
                        style={inputStyle}
                      />
                    ) : (
                      <input
                        type={field.type ?? 'text'}
                        value={current}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        style={inputStyle}
                      />
                    )}
                    {field.hint && (
                      <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>
                        {field.hint}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Sticky save bar */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          marginTop: 32,
          padding: 16,
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '12px 32px', opacity: saving ? 0.6 : 1 }}
        >
          <span>{saving ? 'Enregistrement…' : '💾 Enregistrer tous les changements'}</span>
          <span className="shimmer" />
        </button>
      </div>
    </div>
  )
}
