'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/lib/useTheme'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/livres', label: 'Livres' },
  { href: '/auteurs', label: 'Auteurs' },
  { href: '/evenements', label: 'Événements' },
  { href: '/revue', label: 'Revue' },
  { href: '/magazine', label: 'Magazine' },
  { href: '/avis', label: "Livre d'or" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lastY = 0
    let rafId: number | null = null
    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        const newScrolled = y > 40
        const newHidden = y > 200 && y > lastY
        setScrolled((prev) => (prev !== newScrolled ? newScrolled : prev))
        setHidden((prev) => (prev !== newHidden ? newHidden : prev))
        lastY = y
        rafId = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [userMenuOpen])

  const isAdmin = session?.user?.role === 'ADMIN'
  const initials = (session?.user?.name || session?.user?.email || '?')
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <header
        className={`fk-header ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden' : ''}`}
      >
        <div className="fk-container">
          <Link href="/" className="brand" aria-label="FK Éditions">
            <span className="brand-mark">Fk</span>
            <span className="brand-name">ÉDITIONS</span>
          </Link>

          <nav className="fk-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            {session ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="icon-btn"
                  aria-label="Mon compte"
                  aria-expanded={userMenuOpen}
                  style={{ position: 'relative' }}
                >
                  {(session.user as { avatar?: string })?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(session.user as { avatar?: string }).avatar}
                      alt=""
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'var(--serif)',
                        fontStyle: 'italic',
                      }}
                    >
                      {initials}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div
                    className="user-menu"
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      minWidth: 240,
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: 8,
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 14px',
                        borderBottom: '1px solid var(--line)',
                        marginBottom: 4,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--serif)',
                          fontStyle: 'italic',
                          fontSize: 15,
                          color: 'var(--ink)',
                          marginBottom: 2,
                        }}
                      >
                        {session.user?.name || 'Compte'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--ink-mute)', wordBreak: 'break-all' }}>
                        {session.user?.email}
                      </p>
                    </div>

                    {isAdmin && (
                      <UserMenuLink href="/admin" onClick={() => setUserMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="3" y="3" width="7" height="9" />
                          <rect x="14" y="3" width="7" height="5" />
                          <rect x="14" y="12" width="7" height="9" />
                          <rect x="3" y="16" width="7" height="5" />
                        </svg>
                        Espace Admin
                      </UserMenuLink>
                    )}
                    <UserMenuLink href="/bibliotheque" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Ma bibliothèque
                    </UserMenuLink>
                    <UserMenuLink href="/compte" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21a8 8 0 0 1 16 0" />
                      </svg>
                      Mon compte
                    </UserMenuLink>

                    <div style={{ height: 1, background: 'var(--line)', margin: '6px 4px' }} />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      role="menuitem"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: '#dc2626',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="icon-btn" aria-label="Connexion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </Link>
            )}

            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label="Basculer thème"
            >
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              </span>
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              </span>
            </button>

            <button
              className={`mobile-burger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <aside className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="mobile-menu-auth">
          {session ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>
                  Espace Admin
                </Link>
              )}
              <Link href="/bibliotheque" onClick={() => setMobileOpen(false)}>
                Ma bibliothèque
              </Link>
              <Link href="/compte" onClick={() => setMobileOpen(false)}>
                Mon compte
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
                className="btn btn-ghost"
                style={{ textAlign: 'left', color: '#dc2626' }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>
                Connexion
              </Link>
              <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
                Inscription
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

function UserMenuLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        fontSize: 14,
        color: 'var(--ink)',
        textDecoration: 'none',
        transition: 'background 0.15s var(--ease-out), color 0.15s var(--ease-out)',
      }}
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
