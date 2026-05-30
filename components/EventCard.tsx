import Link from 'next/link'

interface EventCardProps {
  event: {
    id: string
    title: string
    date: Date | string
    location?: string | null
    description?: string | null
    imageUrl?: string | null
  }
}

export default function EventCard({ event }: EventCardProps) {
  const date = new Date(event.date)
  const isValid = !isNaN(date.getTime())
  const day = isValid ? date.getDate() : '—'
  const month = isValid ? date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase() : ''
  const year = isValid ? date.getFullYear() : ''

  return (
    <div className="group flex flex-col bg-dark-3 border border-dark-4 hover:border-gold/30 transition-all duration-300 overflow-hidden">
      {/* Date banner */}
      <div className="bg-gold px-6 py-4 flex items-center gap-4">
        <div className="text-center">
          <p className="font-serif text-3xl font-bold text-dark leading-none">{day}</p>
          <p className="text-xs uppercase tracking-widest text-dark/80 font-semibold mt-0.5">
            {month} {year}
          </p>
        </div>
        {event.location && (
          <>
            <div className="w-px h-10 bg-dark/20" />
            <div>
              <p className="text-xs text-dark/70">{event.location}</p>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-serif text-base text-cream leading-snug">{event.title}</h3>
          {event.location && (
            <div className="flex items-center gap-2 mt-2">
              <svg className="w-3.5 h-3.5 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs text-cream-muted">{event.location}</p>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-cream-muted leading-relaxed line-clamp-3">{event.description}</p>
        )}

        <Link
          href="/contact"
          className="mt-auto self-start text-xs text-gold border-b border-gold/40 hover:border-gold transition-colors pb-0.5"
        >
          En savoir plus →
        </Link>
      </div>
    </div>
  )
}
