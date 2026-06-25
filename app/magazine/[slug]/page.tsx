import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Book } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { groupMagazines } from '@/lib/magazine'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const magazines = await prisma.book.findMany({ where: { published: true, isMagazine: true } })
  const group = groupMagazines(magazines).find((g) => g.key === slug)
  if (!group) return {}
  return {
    title: `${group.name} — Espace Magazine`,
    description: `Choisissez votre édition du magazine ${group.name} : Premium ou Gold.`,
  }
}

function tierLabel(book: Book): string {
  if (book.tier === 'GOLD') return 'Gold'
  if (book.tier === 'PREMIUM') return 'Premium'
  return book.title
}

export default async function MagazineChoicePage({ params }: Props) {
  const { slug } = await params

  const magazines = await prisma.book.findMany({
    where: { published: true, isMagazine: true },
    orderBy: { createdAt: 'desc' },
  })
  const group = groupMagazines(magazines).find((g) => g.key === slug)
  if (!group) notFound()

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
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', textTransform: 'uppercase' }}>
              Accueil
            </Link>
            <span>/</span>
            <Link href="/magazine" style={{ textDecoration: 'none', color: 'inherit', textTransform: 'uppercase' }}>
              Magazine
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
              }}
            >
              {group.name}
            </span>
          </div>
        </div>
      </div>

      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(48px, 6vh, 80px)', paddingBottom: 'clamp(60px, 8vh, 100px)' }}
      >
        <div className="fk-container" style={{ maxWidth: 1000 }}>
          {/* En-tête vedette */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 240px) 1fr',
              gap: 'clamp(24px, 4vw, 48px)',
              alignItems: 'center',
              marginBottom: 'clamp(40px, 6vh, 64px)',
            }}
            className="magazine-choice-header"
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '3 / 4',
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: 'var(--line)',
              }}
            >
              {group.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={group.photo} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                  FK Magazine
                </div>
              )}
            </div>

            <div>
              <span className="kicker" style={{ color: 'var(--accent)' }}>Espace Magazine</span>
              <h1
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(32px, 5vw, 56px)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.05,
                  color: 'var(--ink)',
                  margin: '12px 0 16px',
                }}
              >
                {group.name}
              </h1>
              {group.event && (
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span aria-hidden>📅</span>
                  <span>{group.event}</span>
                </p>
              )}
              <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                Choisissez votre édition : la version <strong style={{ color: 'var(--ink)' }}>Premium</strong>{' '}
                ou la version <strong style={{ color: 'var(--ink)' }}>Gold</strong>, plus exclusive.
              </p>
            </div>
          </div>

          {/* Choix des éditions */}
          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
            }}
          >
            {group.editions.map((edition) => {
              const isGold = edition.tier === 'GOLD'
              const label = tierLabel(edition)
              return (
                <div
                  key={edition.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: isGold ? '1px solid var(--accent)' : '1px solid var(--line)',
                    background: isGold ? 'var(--accent-soft)' : 'var(--bg-elev)',
                    padding: 'clamp(24px, 4vw, 36px)',
                  }}
                >
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      padding: '5px 12px',
                      color: isGold ? '#fff' : 'var(--ink)',
                      background: isGold ? 'var(--accent)' : 'transparent',
                      border: isGold ? 'none' : '1px solid var(--line)',
                      marginBottom: 20,
                    }}
                  >
                    Édition {label}
                  </span>

                  <p
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 'clamp(32px, 4vw, 44px)',
                      lineHeight: 1,
                      color: 'var(--ink)',
                      marginBottom: 6,
                    }}
                  >
                    {edition.price} <span style={{ fontSize: 18, color: 'var(--ink-mute)' }}>$ USD</span>
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 16 }}>
                    {edition.type === 'PHYSICAL' ? 'Magazine physique' : 'Magazine numérique (PDF)'}
                    {edition.preOrder ? ' · Pré-commande' : ''}
                  </p>

                  <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: 24, flex: 1 }}>
                    {edition.description}
                  </p>

                  <Link
                    href={`/livres/${edition.slug}`}
                    className={isGold ? 'btn btn-primary' : 'btn btn-ghost'}
                    style={{ justifyContent: 'center' }}
                  >
                    <span>Acheter l&apos;édition {label}</span>
                    {isGold && <span className="shimmer" />}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
