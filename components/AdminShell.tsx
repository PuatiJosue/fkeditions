'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTheme } from '@/lib/useTheme'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
  )},
  { href: '/admin/commandes', label: 'Commandes', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 7h12l-1.5 11a2 2 0 0 1-2 1.7H9.5a2 2 0 0 1-2-1.7L6 7z"/><path d="M9 7V5a3 3 0 1 1 6 0v2"/></svg>
  )},
  { href: '/admin/abonnements', label: 'Abonnements', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>
  )},
  { href: '/admin/livres', label: 'Livres', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
  )},
  { href: '/admin/auteurs', label: 'Auteurs', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
  )},
  { href: '/admin/evenements', label: 'Événements', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
  )},
  { href: '/admin/revue', label: 'Revue', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5h16v14H4z"/><path d="M4 9h16M8 5v14"/></svg>
  )},
  { href: '/admin/magazine', label: 'Magazines', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h16v16H4z"/><path d="M8 4v16M8 8h12M8 12h12"/></svg>
  )},
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20a4 4 0 0 1 7 0"/></svg>
  )},
  { href: '/admin/avis', label: 'Livre d\'or', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  )},
  { href: '/admin/newsletter', label: 'Newsletter', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7l9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
  )},
  { href: '/admin/journal', label: 'Journal sécurité', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2 4 6v6c0 5 3.5 9.4 8 10 4.5-.6 8-5 8-10V6l-8-4z"/></svg>
  )},
  { href: '/admin/parametres', label: 'Paramètres', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
  )},
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="admin-shell">
      {/* Sidebar desktop */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark" style={{ fontSize: 32 }}>Fk</span>
          <span style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--ink-mute)', fontWeight: 600 }}>
            ADMIN
          </span>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${isActive(item.href) ? 'is-active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <button
            onClick={toggle}
            className="admin-theme-btn"
            aria-label="Basculer thème"
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
            <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
          </button>
          <Link href="/" className="admin-nav-link" style={{ marginTop: 6 }}>
            <span className="admin-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </span>
            <span>Retour au site</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="admin-nav-link"
            style={{
              marginTop: 6,
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              color: '#dc2626',
              fontFamily: 'inherit',
            }}
          >
            <span className="admin-nav-icon" style={{ color: 'inherit' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Mobile topbar */}
        <div className="admin-mobile-bar">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="brand-mark" style={{ fontSize: 24 }}>Fk</span>
            <span style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--ink-mute)', fontWeight: 600 }}>
              ADMIN
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggle}
              aria-label="Basculer thème"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ink)',
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
              }}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menu admin"
              className={`mobile-burger ${open ? 'open' : ''}`}
              style={{ display: 'inline-flex' }}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div
            style={{
              borderBottom: '1px solid var(--line)',
              background: 'var(--paper)',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', padding: 12, gap: 2 }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`admin-nav-link ${isActive(item.href) ? 'is-active' : ''}`}
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="admin-nav-link"
                >
                  <span className="admin-nav-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                  </span>
                  Retour au site
                </Link>
                <button
                  onClick={() => {
                    setOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="admin-nav-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#dc2626',
                    fontFamily: 'inherit',
                  }}
                >
                  <span className="admin-nav-icon" style={{ color: 'inherit' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                  </span>
                  Déconnexion
                </button>
              </div>
            </nav>
          </div>
        )}

        <main className="admin-content">
          <div style={{ padding: 'clamp(20px, 3vw, 40px)' }}>{children}</div>
        </main>
      </div>
    </div>
  )
}
