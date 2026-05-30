import Link from 'next/link'

export interface EventCardData {
  id: string
  title: string
  date: Date | string
  location: string
  city: string
  description: string
}

interface EventsSectionProps {
  events: EventCardData[]
}

function formatDate(d: Date | string): { day: string; month: string } {
  const date = typeof d === 'string' ? new Date(d) : d
  const day = String(date.getDate()).padStart(2, '0')
  const months = [
    'Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
  ]
  const month = `${months[date.getMonth()]} ${date.getFullYear()}`
  return { day, month }
}

export default function EventsSection({ events }: EventsSectionProps) {
  return (
    <section className="events-section" id="evenements">
      <div className="fk-container">
        <div className="section-head reveal">
          <div className="section-head-left">
            <span className="kicker">Agenda</span>
            <h2 className="section-title">
              Rencontrez nos <em className="serif-i">auteurs</em>
            </h2>
          </div>
          <Link href="/evenements" className="link-arrow">
            Tous les événements
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="reveal-stagger">
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-mute)' }}>
              Aucun événement à venir pour le moment. Revenez bientôt !
            </p>
          ) : (
            events.map((event) => {
              const { day, month } = formatDate(event.date)
              return (
                <Link href={`/evenements#${event.id}`} key={event.id} className="event-card">
                  <div className="event-date">
                    <span className="day">{day}</span>
                    <span className="month">{month}</span>
                  </div>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <div className="event-loc">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s-7-7.5-7-13a7 7 0 1 1 14 0c0 5.5-7 13-7 13z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {event.location} · {event.city}
                    </div>
                    <p className="event-desc">{event.description}</p>
                  </div>
                  <span className="event-cta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </span>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
