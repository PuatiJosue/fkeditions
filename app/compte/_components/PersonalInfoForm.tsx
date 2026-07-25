'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Dispatch, SetStateAction } from 'react'
import { Banner, Field } from '@/components/auth/AuthForm'
import type { UserProfile, Msg } from './types'

type Props = {
  profile: UserProfile | null
  setProfile: Dispatch<SetStateAction<UserProfile | null>>
}

/** Formulaire d'édition du nom et de l'email (mot de passe requis pour l'email). */
export default function PersonalInfoForm({ profile, setProfile }: Props) {
  const { update } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [infoPassword, setInfoPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<Msg | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setEmail(profile.email ?? '')
    }
  }, [profile?.name, profile?.email])

  const emailChanged = profile ? email !== profile.email : false

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    if (emailChanged && !infoPassword) {
      setMsg({ type: 'err', text: "Entrez votre mot de passe actuel pour changer l'email." })
      setLoading(false)
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
      setMsg({ type: 'ok', text: 'Informations mises à jour.' })
      setInfoPassword('')
    } catch (err: unknown) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur inattendue' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 'clamp(24px, 3vw, 36px)' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 24 }}>
        Informations personnelles
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        <Field label="Nom affiché" type="text" value={name} onChange={setName} required />
        <Field label="Adresse email" type="email" value={email} onChange={setEmail} required />
        {emailChanged && (
          <>
            <p style={{ fontSize: 12, color: 'var(--accent)' }}>
              Vous modifiez votre email — un mot de passe est requis.
            </p>
            <Field label="Mot de passe actuel" type="password" value={infoPassword} onChange={setInfoPassword} placeholder="••••••••" required />
          </>
        )}
        {msg && <Banner kind={msg.type === 'ok' ? 'success' : 'error'}>{msg.text}</Banner>}
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: loading ? 0.6 : 1, padding: '12px 28px' }}>
          <span>{loading ? 'Enregistrement…' : 'Enregistrer'}</span>
          <span className="shimmer" />
        </button>
      </form>
    </div>
  )
}
