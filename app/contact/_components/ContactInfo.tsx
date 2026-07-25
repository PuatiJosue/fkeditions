'use client'

import type { ReactNode } from 'react'

function ContactRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        {icon}
      </span>
      <div>
        <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 4 }}>
          {label}
        </p>
        <div style={{ fontSize: 15 }}>{children}</div>
      </div>
    </li>
  )
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      style={{ width: 40, height: 40, border: '1px solid var(--line)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', textDecoration: 'none', transition: 'all 0.3s var(--ease-out)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--ink)'
        e.currentTarget.style.color = 'var(--bg)'
        e.currentTarget.style.borderColor = 'var(--ink)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = ''
        e.currentTarget.style.color = 'var(--ink)'
        e.currentTarget.style.borderColor = 'var(--line)'
      }}>
      <span style={{ width: 16, height: 16, display: 'flex' }}>{children}</span>
    </a>
  )
}

/** Coordonnées de FK Éditions et liens vers les réseaux sociaux. */
export default function ContactInfo() {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 28, color: 'var(--ink)', marginBottom: 24 }}>
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
            <a href="mailto:editionsfk@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
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
            <a href="tel:+243829082048" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
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
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 16 }}>
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
  )
}
