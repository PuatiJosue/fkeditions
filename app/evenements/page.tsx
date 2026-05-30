import { prisma } from '@/lib/prisma'
import { events as staticEvents } from '@/data/events'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Événements — FK Éditions' }

interface EventItem {
  id: string
  title: string
  date: Date
  location: string
  description: string
}

async function fetchEvents(): Promise<{ upcoming: EventItem[]; past: EventItem[] }> {
  try {
    const events = await prisma.event.findMany({
      where: { published: true },
      orderBy: { date: 'asc' },
    })
    const now = new Date()
    const mapped: EventItem[] = events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      location: e.location || '',
      description: e.description || '',
    }))
    return {
      upcoming: mapped.filter((e) => e.date >= now),
      past: mapped.filter((e) => e.date < now),
    }
  } catch (err) {
    console.warn('[EvenementsPage] DB unreachable, falling back to static data.', err)
    const today = new Date()
    return {
      upcoming: staticEvents.map((e, i) => ({
        id: e.id,
        title: e.title,
        date: new Date(today.getTime() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
        location: `${e.location} · ${e.city}`,
        description: e.description,
      })),
      past: [],
    }
  }
}

function formatDate(d: Date): { day: string; month: string } {
  const day = String(d.getDate()).padStart(2, '0')
  const months = [
    'Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
  ]
  return { day, month: `${months[d.getMonth()]} ${d.getFullYear()}` }
}

function EventRow({ event, dim = false }: { event: EventItem; dim?: boolean }) {
  const { day, month } = formatDate(event.date)
  return (
    <Link
      href={`#${event.id}`}
      id={event.id}
      className="event-card"
      style={dim ? { opacity: 0.55 } : undefined}
    >
      <div className="event-date">
        <span className="day">{day}</span>
        <span className="month">{month}</span>
      </div>
      <div className="event-info">
        <h3>{event.title}</h3>
        {event.location && (
          <div className="event-loc">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s-7-7.5-7-13a7 7 0 1 1 14 0c0 5.5-7 13-7 13z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {event.location}
          </div>
        )}
        {event.description && <p className="event-desc">{event.description}</p>}
      </div>
      <span className="event-cta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
    </Link>
  )
}

export default async function EvenementsPage() {
  const { upcoming, past } = await fetchEvents()

  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Agenda FK Éditions</span>
          <h1 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Événements à <em className="serif-i">venir</em>
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
            Rencontrez nos auteurs lors de séances dédicaces, lancements de livres
            et soirées littéraires à Kinshasa et à travers le monde.
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          {upcoming.length > 0 ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <span className="kicker">Prochains événements</span>
              </div>
              <div>
                {upcoming.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 32px',
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 24,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}
              >
                Aucun événement à venir
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-mute)' }}>
                Revenez bientôt pour découvrir nos prochaines rencontres.
              </p>
            </div>
          )}

          {past.length > 0 && (
            <div style={{ marginTop: 80 }}>
              <div style={{ marginBottom: 24 }}>
                <span className="kicker">Événements passés</span>
              </div>
              <div>
                {past.map((e) => (
                  <EventRow key={e.id} event={e} dim />
                ))}
              </div>
            </div>
          )}

          {/* Contact box */}
          <div
            style={{
              marginTop: 80,
              padding: 40,
              background: 'var(--bg-elev)',
              border: '1px solid var(--line)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 32,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 26,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 10,
                  letterSpacing: '-0.01em',
                }}
              >
                Organisez un événement avec FK Éditions
              </h3>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640, fontSize: 16 }}>
                Vous souhaitez accueillir un de nos auteurs dans votre librairie,
                université ou espace culturel ? Contactez-nous pour discuter des
                possibilités de partenariat et d&apos;organisation.
              </p>
              <Link href="/contact" className="link-arrow" style={{ marginTop: 20, display: 'inline-flex' }}>
                Nous contacter
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
