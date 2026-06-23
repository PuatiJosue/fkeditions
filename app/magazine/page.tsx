import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Espace Magazine — FK Éditions' }

export default async function MagazinePage() {
  const magazines = await prisma.book.findMany({
    where: { published: true, isMagazine: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  })

  return (
    <>
      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}
      >
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>FK Éditions présente</span>
          <h1 className="section-title">
            L&apos;Espace <em className="serif-i">Magazine</em>
          </h1>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container" style={{ maxWidth: 820 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(24px, 3.2vw, 36px)',
                lineHeight: 1.4,
                color: 'var(--ink)',
                marginBottom: 24,
              }}
            >
              « Ici, le temps s&apos;arrête pour laisser place à l&apos;excellence. »
            </p>
            <div
              style={{
                width: 48,
                height: 2,
                background: 'var(--accent)',
                margin: '0 auto',
              }}
            />
          </div>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.75,
              color: 'var(--ink-soft)',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '4em',
                float: 'left',
                lineHeight: 0.85,
                padding: '8px 12px 0 0',
                color: 'var(--accent)',
                fontWeight: 500,
              }}
            >
              N
            </span>
            ous vous recevons dans notre <strong style={{ color: 'var(--ink)' }}>espace magazine</strong>.
            Vous n&apos;êtes pas un simple visiteur, vous êtes l&apos;invité d&apos;un sanctuaire où{' '}
            <strong style={{ color: 'var(--ink)' }}>le sport, la mode, la musique et la culture</strong>{' '}
            ne se parcourent pas : ils se vivent.
          </p>

          <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--ink-soft)', marginBottom: 40 }}>
            Installez-vous. Ouvrez les pages. Découvrez ce que l&apos;époque a de plus grand à vous offrir.
          </p>

          <div
            style={{
              background: 'var(--bg-elev)',
              border: '1px solid var(--line)',
              borderLeft: '3px solid var(--accent)',
              padding: 'clamp(24px, 4vw, 36px)',
              marginBottom: 48,
            }}
          >
            <p
              className="kicker"
              style={{ marginBottom: 12 }}
            >
              Au programme
            </p>
            <ul style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <li style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
                  ✦ Récits & reportages
                </strong>
                Plongées dans la vie culturelle congolaise.
              </li>
              <li style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
                  ✦ Interviews
                </strong>
                Auteurs, musiciens, penseurs en intimité.
              </li>
              <li style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
                  ✦ Coulisses éditoriales
                </strong>
                Comment naît un livre chez FK Éditions.
              </li>
              <li style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
                  ✦ Critiques & coups de cœur
                </strong>
                Notre regard sur la littérature d&apos;ici et d&apos;ailleurs.
              </li>
            </ul>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 18,
                color: 'var(--ink-mute)',
                marginBottom: 20,
              }}
            >
              Premiers articles à paraître prochainement.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              <Link href="#newsletter" className="btn btn-primary">
                <span>S&apos;abonner à la newsletter</span>
                <span className="shimmer" />
              </Link>
              <Link href="/revue" className="btn btn-ghost">
                Découvrir la Revue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {magazines.length > 0 && (
        <section className="fk-section" style={{ paddingTop: 0, paddingBottom: 'clamp(60px, 8vh, 100px)' }}>
          <div className="fk-container">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span className="kicker" style={{ justifyContent: 'center' }}>Nos parutions</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                Les <em className="serif-i">Magazines</em>
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 24,
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              }}
            >
              {magazines.map((mag) => {
                const photo = mag.featuredImage || mag.coverImage
                const name = mag.featuredName || mag.title
                return (
                  <Link
                    key={mag.id}
                    href={`/livres/${mag.slug}`}
                    style={{
                      position: 'relative',
                      display: 'block',
                      aspectRatio: '3 / 4',
                      overflow: 'hidden',
                      border: '1px solid var(--line)',
                      background: 'var(--line)',
                      textDecoration: 'none',
                    }}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                        FK Magazine
                      </div>
                    )}

                    {mag.preOrder && (
                      <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>
                        Pré-commande
                      </span>
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        left: 0, right: 0, bottom: 0,
                        padding: '48px 16px 16px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.15) 70%, rgba(0,0,0,0))',
                      }}
                    >
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.15, color: '#fff', margin: 0 }}>
                        {name}
                      </h3>
                      <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e6c07b' }}>
                        Découvrir le magazine →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
