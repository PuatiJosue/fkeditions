import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BookFormatSelector from '@/components/checkout/BookFormatSelector'
import BookCover from './BookCover'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; cancelled?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  try {
    const book = await prisma.book.findUnique({ where: { slug: id }, include: { author: true } })
    if (!book) return {}

    const image = book.coverImage
      ? { url: book.coverImage, width: 400, height: 600, alt: book.title }
      : { url: '/og-image.jpg', width: 1200, height: 630, alt: book.title }

    return {
      title: book.title,
      description: book.description,
      openGraph: {
        type: 'book',
        title: book.title,
        description: book.description,
        url: `/livres/${book.slug}`,
        images: [image],
        authors: book.author?.name ? [book.author.name] : ['FK Éditions'],
      },
      twitter: {
        card: 'summary_large_image',
        title: book.title,
        description: book.description,
        images: [image.url],
      },
    }
  } catch {
    return { title: id }
  }
}

export default async function BookPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const book = await prisma.book.findUnique({
    where: { slug: id, published: true },
    include: { author: true },
  })
  if (!book) notFound()

  const related = await prisma.book.findMany({
    where: { published: true, slug: { not: id }, isMagazine: false },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  })

  const content = Array.isArray(book.content) ? (book.content as string[]) : null
  const releaseDate = book.releaseDate?.toISOString() ?? undefined
  const releaseLong = releaseDate
    ? new Date(releaseDate).toLocaleDateString('fr-FR', {
        timeZone: 'UTC',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <>
      {/* Breadcrumb */}
      <div
        style={{
          background: 'var(--bg-elev)',
          borderBottom: '1px solid var(--line)',
          padding: '14px 0',
          fontSize: 12,
          letterSpacing: '0.06em',
        }}
      >
        <div className="fk-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-mute)' }}>
            <Link
              href="/"
              style={{ textDecoration: 'none', color: 'inherit', textTransform: 'uppercase' }}
            >
              Accueil
            </Link>
            <span>/</span>
            <Link
              href="/livres"
              style={{ textDecoration: 'none', color: 'inherit', textTransform: 'uppercase' }}
            >
              Livres
            </Link>
            <span>/</span>
            <span
              style={{
                color: 'var(--ink)',
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 14,
                letterSpacing: 0,
                textTransform: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 320,
              }}
            >
              {book.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main */}
      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(48px, 6vh, 80px)', paddingBottom: 'clamp(60px, 8vh, 100px)' }}
      >
        <div className="fk-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 1fr) 1.4fr',
              gap: 'clamp(40px, 6vw, 96px)',
              alignItems: 'start',
            }}
            className="book-detail-grid"
          >
            <BookCover src={book.coverImage} title={book.title} preOrder={book.preOrder} price={book.price} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <span
                  className="kicker"
                  style={{ color: 'var(--accent)', margin: 0 }}
                >
                  {book.category}
                </span>
                {book.year && (
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                    · {book.year}
                  </span>
                )}
              </div>

              <h1
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.05,
                  color: 'var(--ink)',
                  marginBottom: 24,
                }}
              >
                {book.title}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                <div style={{ width: 2, height: 36, background: 'var(--accent)' }} />
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-mute)',
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {book.coAuthors ? 'Auteurs' : 'Auteur'}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: 20,
                      color: 'var(--ink)',
                    }}
                  >
                    {book.author?.name ?? 'FK Éditions'}
                    {book.coAuthors && (
                      <span style={{ color: 'var(--ink-soft)' }}> & {book.coAuthors}</span>
                    )}
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: 'var(--ink-soft)',
                  marginBottom: 28,
                }}
              >
                {book.description}
              </p>

              {book.preOrder && releaseLong && (
                <div
                  style={{
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent-deep)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 28,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Pré-commande
                    </p>
                    <p style={{ fontSize: 14 }}>
                      Payez maintenant et recevez votre livre dès le{' '}
                      <strong>{releaseLong}</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 20,
                  padding: '24px 0',
                  borderTop: '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                  marginBottom: 32,
                }}
              >
                <MetaItem
                  label="Format"
                  value={
                    book.pricePhysical
                      ? 'Ebook PDF · Livre physique'
                      : book.type === 'EBOOK'
                      ? 'Ebook (PDF)'
                      : 'Livre physique'
                  }
                />
                {book.pages && <MetaItem label="Pages" value={`${book.pages} pages`} />}
                <MetaItem label="Langue" value="Français" />
                <MetaItem
                  label="Accès"
                  value={
                    book.preOrder && releaseDate
                      ? `Le ${new Date(releaseDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long' })}`
                      : 'Immédiat après achat'
                  }
                />
              </div>

              <BookFormatSelector
                bookId={book.slug}
                bookTitle={book.title}
                price={book.price}
                pricePhysical={book.pricePhysical}
                priceAudio={book.priceAudio}
                successParam={sp.success}
                cancelledParam={sp.cancelled}
                preOrder={book.preOrder}
                releaseDate={releaseDate}
              />

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  paddingTop: 20,
                  marginTop: 4,
                }}
              >
                {[
                  { icon: '🔒', text: 'Paiement sécurisé' },
                  book.preOrder && releaseDate
                    ? {
                        icon: '📅',
                        text: `Livraison le ${new Date(releaseDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long' })}`,
                      }
                    : { icon: '⚡', text: 'Accès immédiat' },
                  { icon: '📱', text: 'Lisible sur tous appareils' },
                ].map((badge) => (
                  <div
                    key={badge.text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--ink-mute)',
                    }}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Excerpt */}
      {content && content.length > 0 && (
        <section className="spotlight" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(60px, 8vh, 100px)' }}>
          <div className="fk-container" style={{ maxWidth: 800 }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span className="kicker" style={{ justifyContent: 'center' }}>Extrait</span>
              <h2
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                  marginTop: 16,
                }}
              >
                Avant-goût du <em className="serif-i" style={{ color: 'var(--accent)' }}>livre</em>
              </h2>
            </div>

            <div style={{ position: 'relative' }}>
              {content.slice(0, 3).map((paragraph, i) => {
                const isHead =
                  paragraph.startsWith('Chapitre') ||
                  paragraph.startsWith('Prologue') ||
                  paragraph.startsWith('Introduction')
                return isHead ? (
                  <h3
                    key={i}
                    style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      color: 'var(--accent)',
                      fontSize: 22,
                      marginTop: 28,
                      marginBottom: 12,
                    }}
                  >
                    {paragraph}
                  </h3>
                ) : (
                  <p
                    key={i}
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 17,
                      lineHeight: 1.8,
                      color: 'var(--ink-soft)',
                      textIndent: '2em',
                      marginBottom: 14,
                    }}
                  >
                    {paragraph}
                  </p>
                )
              })}
              <div style={{ position: 'relative', marginTop: 14 }}>
                <p
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 17,
                    lineHeight: 1.8,
                    color: 'var(--ink-soft)',
                    textIndent: '2em',
                    opacity: 0.4,
                    userSelect: 'none',
                  }}
                >
                  {content[3] ?? '...'}
                </p>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, transparent, var(--bg-elev) 80%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 40,
                padding: 'clamp(32px, 4vw, 48px)',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 6 }}>
                Vous avez atteint la fin de l&apos;extrait gratuit
              </p>
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 22,
                  color: 'var(--ink)',
                  marginBottom: 24,
                }}
              >
                Continuez la lecture pour{' '}
                <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
                  {book.price} $ USD
                </span>
              </p>
              <BookFormatSelector
                bookId={book.slug}
                bookTitle={book.title}
                price={book.price}
                pricePhysical={book.pricePhysical}
                priceAudio={book.priceAudio}
                preOrder={book.preOrder}
                releaseDate={releaseDate}
              />
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)' }}>
          <div className="fk-container">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span className="kicker" style={{ justifyContent: 'center' }}>Vous aimerez aussi</span>
              <h2
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                  marginTop: 16,
                }}
              >
                Autres titres <em className="serif-i" style={{ color: 'var(--accent)' }}>FK Éditions</em>
              </h2>
            </div>
            <div className="book-grid">
              {related.map((b) => (
                <Link key={b.slug} href={`/livres/${b.slug}`} className="book-card">
                  <div className="book-card-cover-wrap">
                    <span className={`book-badge ${b.preOrder ? 'preorder' : ''}`}>
                      {b.preOrder ? 'Pré-commande' : b.category}
                    </span>
                    <span className="book-price">{b.price} $</span>
                    {b.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.coverImage} alt={b.title} />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                        }}
                      />
                    )}
                    <div className="book-card-overlay">
                      <span className="book-card-overlay-text">
                        Voir le livre
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="book-meta">
                    <span className="cat">{b.category}</span>
                  </div>
                  <h3 className="book-title">{b.title}</h3>
                  {b.author?.name && <p className="book-author">{b.author.name}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 15, color: 'var(--ink)' }}>{value}</p>
    </div>
  )
}
