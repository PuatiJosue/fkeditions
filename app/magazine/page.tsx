import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { groupMagazines } from '@/lib/magazine'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Espace Magazine — FK Éditions' }

export default async function MagazinePage() {
  const magazines = await prisma.book.findMany({
    where: { published: true, isMagazine: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  })
  const groups = groupMagazines(magazines)

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

      {groups.length > 0 && (
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
              {groups.map((group) => (
                <Link
                  key={group.key}
                  href={`/magazine/${group.key}`}
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
                  {group.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={group.photo} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                      FK Magazine
                    </div>
                  )}

                  {group.preOrder && (
                    <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>
                      Pré-commande
                    </span>
                  )}

                  {group.editions.length > 1 && (
                    <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#e6c07b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px' }}>
                      Premium · Gold
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
                      {group.name}
                    </h3>
                    {group.event && (
                      <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.4, color: '#fff', opacity: 0.92, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span aria-hidden style={{ flexShrink: 0 }}>📅</span>
                        <span>{group.event}</span>
                      </p>
                    )}
                    <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e6c07b' }}>
                      Choisir son édition →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
