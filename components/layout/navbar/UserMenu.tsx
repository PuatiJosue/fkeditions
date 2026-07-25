'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import type { ReactNode } from 'react'

function UserMenuLink({ href, children, onClick }: { href: string; children: ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 14, color: 'var(--ink)', textDecoration: 'none', transition: 'background 0.15s var(--ease-out), color 0.15s var(--ease-out)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-elev)'
        e.currentTarget.style.color = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--ink)'
      }}
    >
      {children}
    </Link>
  )
}

function initialsOf(session: Session): string {
  return (session.user?.name || session.user?.email || '?')
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
}

/** Bouton avatar + menu déroulant du compte (desktop). */
export default function UserMenu({ session, isAdmin }: { session: Session; isAdmin: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const avatar = (session.user as { avatar?: string })?.avatar

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} className="icon-btn" aria-label="Mon compte" aria-expanded={open} style={{ position: 'relative' }}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            {initialsOf(session)}
          </span>
        )}
      </button>

      {open && (
        <div className="user-menu" role="menu" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 240, background: 'var(--paper)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)', padding: 8, zIndex: 100 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>
              {session.user?.name || 'Compte'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-mute)', wordBreak: 'break-all' }}>{session.user?.email}</p>
          </div>

          {isAdmin && (
            <UserMenuLink href="/admin" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              Espace Admin
            </UserMenuLink>
          )}
          <UserMenuLink href="/bibliotheque" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Ma bibliothèque
          </UserMenuLink>
          <UserMenuLink href="/compte" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            Mon compte
          </UserMenuLink>

          <div style={{ height: 1, background: 'var(--line)', margin: '6px 4px' }} />

          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
            role="menuitem"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626', fontFamily: 'inherit', textAlign: 'left' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
