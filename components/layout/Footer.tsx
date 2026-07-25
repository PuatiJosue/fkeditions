import Link from 'next/link'
import type { SiteSettings } from '@/lib/settings'
import { SETTING_DEFAULTS } from '@/lib/settings'

export default function Footer({ settings }: { settings?: Partial<SiteSettings> }) {
  const year = new Date().getFullYear()
  const s = { ...SETTING_DEFAULTS, ...(settings ?? {}) }

  return (
    <footer className="fk-footer">
      <div className="fk-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand">
              <span className="brand-mark">Fk</span>
              <span className="brand-name">ÉDITIONS</span>
            </Link>
            <p>{s.footer_about}</p>
            <div className="footer-socials">
              <a href={s.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a href={s.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a href={s.social_whatsapp_channel} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 3.5A10 10 0 0 0 3.6 16.1L2.1 22l6-1.6A10 10 0 1 0 20.5 3.5zm-3 13c-.3.8-1.5 1.5-2.1 1.6-.6.1-1.3.1-2.1-.1-.5-.2-1.1-.4-1.9-.7-3.3-1.4-5.5-4.8-5.7-5-.2-.2-1.3-1.8-1.3-3.4 0-1.6.9-2.4 1.2-2.7.3-.3.7-.4.9-.4h.6c.2 0 .5 0 .7.6.3.7 1 2.4 1.1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.6-.2.2-.3.4-.2.7.2.3.8 1.4 1.7 2.2 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.9.9 2.2 1.1.3.1.5.2.6.3.1.2.1.7-.2 1.4z" />
                </svg>
              </a>
              <a href={s.social_messenger} target="_blank" rel="noopener noreferrer" aria-label="Messenger">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/auteurs">Nos auteurs</Link></li>
              <li><Link href="/livres">Acheter un livre</Link></li>
              <li><Link href="/evenements">Événements</Link></li>
              <li><Link href="/flysys">FLYSYS</Link></li>
              <li><Link href="/avis">Livre d&apos;or</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Informations</h4>
            <ul>
              <li><Link href="/auteurs">À propos</Link></li>
              <li><Link href="/cgv">Conditions de vente</Link></li>
              <li><Link href="/cgv#5">Politique de remboursement</Link></li>
              <li><Link href="/contact">Nous contacter</Link></li>
              <li><Link href="/contact#manuscrit">Soumettre un manuscrit</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Coordonnées</h4>
            <ul>
              <li><a href={`tel:${s.contact_phone.replace(/\s/g, '')}`}>{s.contact_phone}</a></li>
              <li><a href={`mailto:${s.contact_email}`}>{s.contact_email}</a></li>
              <li>
                <a href={s.social_whatsapp_channel} target="_blank" rel="noopener noreferrer">
                  Canal WhatsApp FK Éditions
                </a>
              </li>
              <li>
                <a href={s.social_messenger} target="_blank" rel="noopener noreferrer">
                  Messenger : fkeditions
                </a>
              </li>
              <li style={{ color: 'var(--ink-mute)', fontFamily: 'var(--serif)', fontStyle: 'italic', marginTop: 8 }}>
                {s.contact_city_short}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} FK Éditions. Tous droits réservés.</span>
          <span>
            <em>Fondée par Fortune Khonde</em> · {s.contact_city_short}
          </span>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--ink-mute)',
            opacity: 0.6,
            marginTop: 24,
          }}
        >
          Développé par Josué Puati
        </p>
      </div>
    </footer>
  )
}
