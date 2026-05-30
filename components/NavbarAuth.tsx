'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function NavbarAuth() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="text-xs text-gold border border-gold/40 hover:bg-gold hover:text-dark px-3 py-1.5 transition-colors tracking-widest uppercase"
          >
            Admin
          </Link>
        )}
        <Link
          href="/bibliotheque"
          className="text-xs text-cream-muted hover:text-gold transition-colors tracking-widest uppercase"
        >
          Ma bibliothèque
        </Link>
        <Link
          href="/compte"
          className="text-xs text-cream-muted hover:text-gold transition-colors tracking-widest uppercase"
        >
          Mon compte
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-xs text-cream-muted hover:text-gold transition-colors tracking-widest uppercase"
        >
          Déconnexion
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-xs text-cream-muted hover:text-gold transition-colors tracking-widest uppercase"
      >
        Connexion
      </Link>
      <Link
        href="/register"
        className="text-xs bg-gold hover:bg-gold-light text-dark font-semibold px-4 py-1.5 transition-colors tracking-widest uppercase"
      >
        Inscription
      </Link>
    </div>
  )
}
