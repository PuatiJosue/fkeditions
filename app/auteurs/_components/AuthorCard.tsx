import Link from 'next/link'
import type { AuthorDetail } from '@/lib/services/authors'
import AuthorPortrait from '../AuthorPortrait'

const socialLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px',
  border: '1px solid var(--line)',
  borderRadius: 999,
  fontSize: 12,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
} as const

const kickerStyle = {
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontWeight: 600,
} as const

/** Fiche détaillée d'un auteur : portrait, biographie, réseaux et œuvres. */
export default function AuthorCard({ author }: { author: AuthorDetail }) {
  return (
    <article
      id={author.slug}
      className="author-detail-card"
      style={{ marginBottom: 80, background: 'var(--bg-elev)', border: '1px solid var(--line)', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 0 }}
    >
      <AuthorPortrait photo={author.photo} name={author.name} />

      <div style={{ padding: 'clamp(32px, 5vw, 56px)' }}>
        <p style={{ ...kickerStyle, color: 'var(--accent)', marginBottom: 12 }}>{author.role}</p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--ink)', marginBottom: 28 }}>
          {author.name}
        </h2>

        {author.bio && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {author.bio.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)' }}>{para}</p>
            ))}
          </div>
        )}

        {(author.facebook || author.instagram) && (
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {author.facebook && (
              <a href={author.facebook} target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12z" />
                </svg>
                Facebook
              </a>
            )}
            {author.instagram && author.instagram !== '#' && (
              <a href={author.instagram} target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                Instagram
              </a>
            )}
          </div>
        )}

        {author.books.length > 0 && (
          <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
            <p style={{ ...kickerStyle, color: 'var(--ink-mute)', marginBottom: 16 }}>Œuvres publiées</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {author.books.map((book) => (
                <Link
                  key={book.slug}
                  href={`/livres/${book.slug}`}
                  style={{ fontSize: 13, padding: '8px 18px', border: '1px solid var(--line)', borderRadius: 999, color: 'var(--ink)', textDecoration: 'none', transition: 'all 0.3s var(--ease-out)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}
                >
                  {book.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
