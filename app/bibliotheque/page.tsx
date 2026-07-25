import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserLibrary } from '@/lib/services/library'
import { PurchasedBookCard, RevueIssueCard } from './_components/LibraryCard'
import { SectionHeader, PendingBanner, EmptyLibrary, SubscribeCta } from './_components/LibrarySections'
import { OrderHistoryTable } from './_components/OrderHistory'

export const metadata = { title: 'Ma bibliothèque — FK Éditions' }

const gridStyle = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 'clamp(20px, 3vw, 32px)',
} as const

export default async function BibliothequeePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login?callbackUrl=/bibliotheque')

  const isAdmin = session.user.role === 'ADMIN'
  const { now, purchases, books, pending, revueIssues, revueSubscription } =
    await getUserLibrary(session.user.id, isAdmin)
  const hasRevue = revueSubscription !== null

  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(48px, 6vh, 80px)', paddingBottom: 'clamp(32px, 4vh, 48px)' }}>
        <div className="fk-container">
          <span className="kicker">Mon compte</span>
          <h1 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginTop: 16 }}>
            Ma <em className="serif-i">bibliothèque</em>
          </h1>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-mute)' }}>{session.user.email}</p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
          {pending.length > 0 && <PendingBanner count={pending.length} />}

          {books.length === 0 && !hasRevue && purchases.length === 0 && <EmptyLibrary />}

          {books.length > 0 && (
            <div>
              <SectionHeader title="Mes livres" count={books.length} />
              <div className="book-grid" style={gridStyle}>
                {books.map((book) => (
                  <PurchasedBookCard key={book.id} book={book} now={now} />
                ))}
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
                <div className="book-grid" style={gridStyle}>
                  {revueIssues.map((issue) => (
                    <RevueIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!hasRevue && (books.length > 0 || purchases.length > 0) && <SubscribeCta />}

          {purchases.length > 0 && (
            <div>
              <SectionHeader title="Historique des commandes" />
              <OrderHistoryTable orders={purchases} />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
