'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/lib/useTheme'
import { navLinks } from './navbar/navLinks'
import { useNavbarScroll } from './navbar/useNavbarScroll'
import UserMenu from './navbar/UserMenu'
import MobileMenu from './navbar/MobileMenu'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { toggle } = useTheme()
  const { scrolled, hidden } = useNavbarScroll()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <>
      <header className={`fk-header ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden' : ''}`}>
        <div className="fk-container">
          <Link href="/" className="brand" aria-label="FK Éditions">
            <span className="brand-mark">Fk</span>
            <span className="brand-name">ÉDITIONS</span>
          </Link>

          <nav className="fk-nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            {session ? (
              <UserMenu session={session} isAdmin={isAdmin} />
            ) : (
              <Link href="/login" className="icon-btn" aria-label="Connexion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </Link>
            )}

            <button className="theme-toggle" onClick={toggle} aria-label="Basculer thème">
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

            <button className={`mobile-burger ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} session={session} isAdmin={isAdmin} />
    </>
  )
}
