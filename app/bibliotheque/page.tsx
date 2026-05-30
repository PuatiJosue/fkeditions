import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Ma bibliothèque — FK Éditions' }

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default async function BibliothequeePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login?callbackUrl=/bibliotheque')

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const completedSlugs = purchases
    .filter((p) => p.status === 'COMPLETED')
    .map((p) => p.bookSlug)

  const books = completedSlugs.length > 0
    ? await prisma.book.findMany({ where: { slug: { in: completedSlugs } } })
    : []

  const pending = purchases.filter((p) => p.status === 'PENDING')
  const isAdmin = session.user.role === 'ADMIN'
  const now = new Date()

  type RevueIssue = { id: string; title: string; month: number; year: number; description: string | null; coverImage: string | null; pdfFile: string | null; epubFile: string | null }
  let revueIssues: RevueIssue[] = []
  let revueSubscription: { plan: string; endDate: Date | null } | null = null

  if (isAdmin) {
    revueIssues = await prisma.revueIssue.findMany({
      where: { published: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: { id: true, title: true, month: true, year: true, description: true, coverImage: true, pdfFile: true, epubFile: true },
    })
    revueSubscription = { plan: 'admin', endDate: null }
  } else {
    const sub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: 'COMPLETED', endDate: { gt: now } },
      orderBy: { endDate: 'desc' },
    })
    if (sub) {
      revueSubscription = { plan: sub.plan, endDate: sub.endDate }
      const isMensuel = sub.plan === 'mensuel'
      revueIssues = await prisma.revueIssue.findMany({
        where: isMensuel
          ? { published: true, year: now.getFullYear(), month: now.getMonth() + 1 }
          : { published: true },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        select: { id: true, title: true, month: true, year: true, description: true, coverImage: true, pdfFile: true, epubFile: true },
      })
    }
  }

  const hasRevue = revueSubscription !== null

  return (
    <>
      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(48px, 6vh, 80px)', paddingBottom: 'clamp(32px, 4vh, 48px)' }}
      >
        <div className="fk-container">
          <span className="kicker">Mon compte</span>
          <h1
            className="section-title"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginTop: 16 }}
          >
            Ma <em className="serif-i">bibliothèque</em>
          </h1>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-mute)' }}>{session.user.email}</p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>

          {pending.length > 0 && (
            <div
              style={{
                background: 'rgba(234, 88, 12, 0.08)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                padding: 20,
                color: '#ea580c',
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: 4 }}>
                {pending.length} commande{pending.length > 1 ? 's' : ''} en attente de validation
              </p>
              <p style={{ fontSize: 13, opacity: 0.85 }}>
                Votre paiement Mobile Money est en cours de vérification par notre équipe (sous 24h).
                Vous recevrez un accès dès la validation.
              </p>
            </div>
          )}

          {books.length === 0 && !hasRevue && purchases.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 28, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 12 }}>
                Votre bibliothèque est vide
              </p>
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 32 }}>
                Achetez un ebook ou abonnez-vous à la revue pour commencer votre collection.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
                <Link href="/livres" className="btn btn-primary">
                  <span>Découvrir les livres</span>
                  <span className="shimmer" />
                </Link>
                <Link href="/revue" className="btn btn-ghost">
                  Découvrir la revue
                </Link>
              </div>
            </div>
          )}

          {books.length > 0 && (
            <div>
              <SectionHeader title="Mes livres" count={books.length} />
              <div
                className="book-grid"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'clamp(20px, 3vw, 32px)' }}
              >
                {books.map((book) => {
                  const isLocked = book.preOrder && book.releaseDate && new Date(book.releaseDate) > now
                  return (
                    <article
                      key={book.id}
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          aspectRatio: '2 / 3',
                          background: 'var(--bg-deep)',
                        }}
                      >
                        {book.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--serif)',
                              fontStyle: 'italic',
                              fontSize: 40,
                              color: 'var(--line)',
                            }}
                          >
                            FK
                          </div>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            background: isLocked ? 'var(--accent)' : 'var(--ink)',
                            color: isLocked ? '#fff' : 'var(--bg)',
                            fontSize: 10,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 999,
                          }}
                        >
                          {isLocked ? 'Pré-commandé' : 'Acheté'}
                        </span>
                      </div>

                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                        <div>
                          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                            {book.category}
                          </p>
                          <h3
                            style={{
                              fontFamily: 'var(--serif)',
                              fontSize: 17,
                              lineHeight: 1.25,
                              color: 'var(--ink)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {book.title}
                          </h3>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {isLocked ? (
                            <div style={{
                              padding: '10px 12px',
                              border: '1px solid var(--accent)',
                              background: 'var(--accent-soft)',
                              color: 'var(--accent-deep)',
                              textAlign: 'center',
                              fontSize: 11,
                            }}>
                              <p style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                                Pré-commande
                              </p>
                              <p style={{ fontSize: 10, opacity: 0.85 }}>
                                Dispo le {new Date(book.releaseDate!).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          ) : book.type === 'EBOOK' ? (
                            <>
                              <Link
                                href={`/livres/${book.slug}/lire`}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 11 }}
                              >
                                <span>📖 Lire le livre</span>
                                <span className="shimmer" />
                              </Link>
                              {book.audioFile && (
                                <Link
                                  href={`/livres/${book.slug}/ecouter`}
                                  style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    padding: '10px 12px',
                                    border: '1px solid var(--accent)',
                                    background: 'var(--accent-soft)',
                                    color: 'var(--accent-deep)',
                                    fontSize: 11,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                  }}
                                >
                                  🎧 Écouter
                                </Link>
                              )}
                            </>
                          ) : (
                            <div style={{
                              padding: '10px 12px',
                              border: '1px solid var(--line)',
                              color: 'var(--ink-mute)',
                              textAlign: 'center',
                              fontSize: 11,
                            }}>
                              Livre physique — livraison en cours
                            </div>
                          )}
                          <Link
                            href={`/livres/${book.slug}`}
                            style={{
                              display: 'block',
                              textAlign: 'center',
                              padding: '8px 12px',
                              border: '1px solid var(--line)',
                              color: 'var(--ink-soft)',
                              fontSize: 11,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              textDecoration: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Voir la fiche
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}

          {hasRevue && (
            <div>
              <SectionHeader title="Mes revues" count={revueIssues.length}>
                {revueSubscription && revueSubscription.plan !== 'admin' && revueSubscription.endDate && (
                  <p style={{ fontSize: 13, color: 'var(--ink-mute)' }}>
                    Abonnement actif jusqu&apos;au{' '}
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      {new Date(revueSubscription.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </p>
                )}
              </SectionHeader>

              {revueIssues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, background: 'var(--bg-elev)', border: '1px solid var(--line)' }}>
                  <p style={{ color: 'var(--ink-soft)' }}>Aucun numéro disponible pour le moment. Revenez bientôt !</p>
                </div>
              ) : (
                <div
                  className="book-grid"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'clamp(20px, 3vw, 32px)' }}
                >
                  {revueIssues.map((issue) => (
                    <article
                      key={issue.id}
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'relative', aspectRatio: '2 / 3', background: 'var(--bg-deep)' }}>
                        {issue.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={issue.coverImage} alt={issue.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--line)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 40 }}>
                            FK
                          </div>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            background: 'var(--accent)',
                            color: '#fff',
                            fontSize: 10,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 999,
                          }}
                        >
                          Revue
                        </span>
                      </div>
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
                          {MONTHS[issue.month]} {issue.year}
                        </p>
                        <h3
                          style={{
                            fontFamily: 'var(--serif)',
                            fontSize: 17,
                            lineHeight: 1.25,
                            color: 'var(--ink)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {issue.title}
                        </h3>
                        {issue.description && (
                          <p
                            style={{
                              fontSize: 13,
                              color: 'var(--ink-soft)',
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {issue.description}
                          </p>
                        )}
                        <div style={{ marginTop: 'auto' }}>
                          {issue.pdfFile || issue.epubFile ? (
                            <Link
                              href={`/revue/${issue.id}/lire`}
                              className="btn btn-primary"
                              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 11 }}
                            >
                              <span>Lire la revue</span>
                              <span className="shimmer" />
                            </Link>
                          ) : (
                            <div style={{ padding: '10px 12px', border: '1px solid var(--line)', color: 'var(--ink-mute)', textAlign: 'center', fontSize: 11 }}>
                              Bientôt disponible
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {!hasRevue && (books.length > 0 || purchases.length > 0) && (
            <div
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
                padding: 32,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
              }}
            >
              <div>
                <p className="kicker" style={{ marginBottom: 8 }}>Revue FK Éditions</p>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
                  Abonnez-vous à la revue
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                  Accédez à tous nos numéros et archives depuis votre bibliothèque.
                </p>
              </div>
              <Link href="/revue#abonnements" className="btn btn-primary">
                <span>Voir les abonnements</span>
                <span className="shimmer" />
              </Link>
            </div>
          )}

          {purchases.length > 0 && (
            <div>
              <SectionHeader title="Historique des commandes" />
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-mute)' }}>
                      {['Livre', 'Méthode', 'Statut', 'Date', 'Montant'].map((h, i) => (
                        <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '14px 16px', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '14px 16px', color: 'var(--ink)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.bookTitle}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--ink-soft)' }}>
                          {p.paymentMethod === 'STRIPE' ? 'Carte bancaire' : `Mobile Money${p.mobileOperator ? ` (${p.mobileOperator})` : ''}`}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <StatusPill status={p.status} />
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--ink-soft)' }}>
                          {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                          ${p.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function SectionHeader({ title, count, children }: { title: string; count?: number; children?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--line)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 26,
          color: 'var(--ink)',
          fontWeight: 500,
        }}
      >
        {title}
        {typeof count === 'number' && (
          <span style={{ color: 'var(--ink-mute)', marginLeft: 10, fontStyle: 'normal', fontSize: 16, fontFamily: 'var(--sans)' }}>
            ({count})
          </span>
        )}
      </h2>
      {children}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cfg =
    status === 'COMPLETED'
      ? { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#16a34a', label: 'Complété' }
      : status === 'PENDING'
      ? { bg: 'rgba(234, 88, 12, 0.1)', border: 'rgba(234, 88, 12, 0.3)', text: '#ea580c', label: 'En attente' }
      : { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.3)', text: '#dc2626', label: 'Échoué' }
  return (
    <span
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        padding: '4px 10px',
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {cfg.label}
    </span>
  )
}
