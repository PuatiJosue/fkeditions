'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { navLinks } from './navLinks'

type Props = { open: boolean; onClose: () => void; session: Session | null; isAdmin: boolean }

/** Panneau de navigation mobile (liens + actions de compte). */
export default function MobileMenu({ open, onClose, session, isAdmin }: Props) {
  const pathname = usePathname()

  return (
    <aside className={`mobile-menu ${open ? 'open' : ''}`}>
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''} onClick={onClose}>
          {link.label}
        </Link>
      ))}
      <div className="mobile-menu-auth">
        {session ? (
          <>
            {isAdmin && (
              <Link href="/admin" className="btn btn-ghost" onClick={onClose}>
                Espace Admin
              </Link>
            )}
            <Link href="/bibliotheque" onClick={onClose}>
              Ma bibliothèque
            </Link>
            <Link href="/compte" onClick={onClose}>
              Mon compte
            </Link>
            <button onClick={() => { onClose(); signOut({ callbackUrl: '/' }) }} className="btn btn-ghost" style={{ textAlign: 'left', color: '#dc2626' }}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost" onClick={onClose}>
              Connexion
            </Link>
            <Link href="/register" className="btn btn-primary" onClick={onClose}>
              Inscription
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
