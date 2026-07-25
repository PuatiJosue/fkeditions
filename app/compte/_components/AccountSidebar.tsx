'use client'

import { useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import type { Dispatch, SetStateAction } from 'react'
import type { UserProfile, Msg } from './types'

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 4px',
  color: 'var(--ink-soft)',
  fontSize: 13,
  letterSpacing: '0.05em',
} as const

function initialsOf(profile: UserProfile | null): string {
  return (profile?.name ?? profile?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type Props = {
  profile: UserProfile | null
  setProfile: Dispatch<SetStateAction<UserProfile | null>>
}

/** Carte latérale : avatar (upload), identité et navigation du compte. */
export default function AccountSidebar({ profile, setProfile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<Msg | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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

  return (
    <aside>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ position: 'relative', width: 96, height: 96, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} aria-label="Changer la photo">
          {displayAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--line)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--accent-soft)', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 28, fontWeight: 600 }}>
              {initialsOf(profile)}
            </div>
          )}
          {avatarLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
        <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', fontSize: 11, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Changer la photo
        </button>
        {avatarMsg && <p style={{ fontSize: 12, color: avatarMsg.type === 'ok' ? '#16a34a' : '#dc2626' }}>{avatarMsg.text}</p>}
        <div style={{ width: '100%', height: 1, background: 'var(--line)', margin: '8px 0' }} />
        <p style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>{profile?.name || 'Utilisateur'}</p>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{profile?.email}</p>
      </div>

      <Link href="/bibliotheque" style={{ ...navItemStyle, textDecoration: 'none' }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Ma bibliothèque
      </Link>
      <button onClick={() => signOut({ callbackUrl: '/' })} style={{ ...navItemStyle, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Se déconnecter
      </button>
    </aside>
  )
}
