import { prisma } from '@/lib/prisma'
import { authors as staticAuthors } from '@/data/authors'
import { books as staticBooks } from '@/data/books'
import Link from 'next/link'
import AuthorPortrait from './AuthorPortrait'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nos auteurs — FK Éditions' }

interface AuthorDetail {
  id: string
  slug: string
  name: string
  role: string
  bio: string | null
  photo: string | null
  facebook?: string | null
  instagram?: string | null
  books: { slug: string; title: string }[]
}

async function fetchAuthors(): Promise<AuthorDetail[]> {
  try {
    const dbAuthors = await prisma.author.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        books: { where: { published: true }, select: { slug: true, title: true } },
      },
    })
    return dbAuthors.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      role: a.role,
      bio: a.bio,
      photo: a.photo,
      facebook: a.facebook,
      instagram: a.instagram,
      books: a.books,
    }))
  } catch (err) {
    console.warn('[AuteursPage] DB unreachable, falling back to static data.', err)
    return staticAuthors.map((a) => ({
      id: a.id,
      slug: a.id,
      name: a.name,
      role: a.role,
      bio: a.bio,
      photo: a.photo,
      facebook: a.social?.facebook ?? null,
      instagram: a.social?.instagram ?? null,
      books: a.books
        .map((bId) => staticBooks.find((b) => b.id === bId))
        .filter((b): b is NonNullable<typeof b> => Boolean(b))
        .map((b) => ({ slug: b.id, title: b.title })),
    }))
  }
}

export default async function AuteursPage() {
  const authors = await fetchAuthors()

  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>La famille FK Éditions</span>
          <h1 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Nos <em className="serif-i">auteurs</em>
          </h1>
          <p
            style={{
              marginTop: 28,
              color: 'var(--ink-soft)',
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Rencontrez les voix qui donnent vie à notre catalogue — des hommes et
            des femmes qui ont choisi de partager leur monde avec vous.
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          {authors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, color: 'var(--ink)' }}>
                Aucun auteur pour le moment
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginTop: 8 }}>Revenez bientôt.</p>
            </div>
          ) : (
            authors.map((author) => (
              <article
                key={author.id}
                id={author.slug}
                style={{
                  marginBottom: 80,
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(280px, 1fr) 2fr',
                  gap: 0,
                }}
                className="author-detail-card"
              >
                <AuthorPortrait
                  photo={author.photo}
                  name={author.name}
                />

                <div style={{ padding: 'clamp(32px, 5vw, 56px)' }}>
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    {author.role}
                  </p>
                  <h2
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 'clamp(32px, 4vw, 56px)',
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                      color: 'var(--ink)',
                      marginBottom: 28,
                    }}
                  >
                    {author.name}
                  </h2>

                  {author.bio && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                      {author.bio.split('\n').filter(Boolean).map((para, i) => (
                        <p
                          key={i}
                          style={{
                            fontSize: 16,
                            lineHeight: 1.65,
                            color: 'var(--ink-soft)',
                          }}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {(author.facebook || author.instagram) && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                      {author.facebook && (
                        <a
                          href={author.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
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
                          }}
                        >
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12z" />
                          </svg>
                          Facebook
                        </a>
                      )}
                      {author.instagram && author.instagram !== '#' && (
                        <a
                          href={author.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
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
                          }}
                        >
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
                      <p
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-mute)',
                          fontWeight: 600,
                          marginBottom: 16,
                        }}
                      >
                        Œuvres publiées
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {author.books.map((book) => (
                          <Link
                            key={book.slug}
                            href={`/livres/${book.slug}`}
                            style={{
                              fontSize: 13,
                              padding: '8px 18px',
                              border: '1px solid var(--line)',
                              borderRadius: 999,
                              color: 'var(--ink)',
                              textDecoration: 'none',
                              transition: 'all 0.3s var(--ease-out)',
                              fontFamily: 'var(--serif)',
                              fontStyle: 'italic',
                            }}
                          >
                            {book.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}

          {/* About FK */}
          <div
            style={{
              marginTop: 40,
              padding: 'clamp(32px, 6vw, 64px)',
              background: 'var(--bg-elev)',
              border: '1px solid var(--line)',
            }}
          >
            <span className="kicker">Notre histoire</span>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
                marginTop: 16,
                marginBottom: 32,
              }}
            >
              À propos de <em className="serif-i" style={{ color: 'var(--accent)' }}>FK Éditions</em>
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 32,
              }}
            >
              <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                FK Éditions est une maison d&apos;édition basée à Kinshasa, en République
                Démocratique du Congo. Fondée en 2020 par Fortune Khonde, elle est
                une voix par laquelle auteurs, écrivains et hommes de lettres
                s&apos;expriment et partagent leurs expériences ainsi que leur parcours.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                Ce voyage, nous voulons le partager avec vous. Chaque livre publié
                par FK Éditions est le fruit d&apos;une collaboration sincère entre
                l&apos;auteur et notre équipe éditoriale, dans un engagement commun pour
                l&apos;excellence littéraire et l&apos;authenticité des voix africaines.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
