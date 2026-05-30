import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import EventActions from './EventActions'

export default async function AdminEvenementsPage() {
  const events = await prisma.event.findMany({ orderBy: { date: 'desc' } })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream">Événements</h1>
          <p className="text-xs text-cream-muted mt-1">{events.length} événement{events.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/evenements/nouveau"
          className="bg-gold hover:bg-gold-light text-dark text-xs font-semibold px-4 py-2.5 uppercase tracking-widest transition-colors"
        >
          + Ajouter un événement
        </Link>
      </div>

      <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dark-4 text-cream-muted">
              <th className="text-left px-4 py-3 font-medium">Titre</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Lieu</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-dark-4 hover:bg-dark-4/30 transition-colors">
                <td className="px-4 py-3 text-cream-dim max-w-xs truncate">{event.title}</td>
                <td className="px-4 py-3 text-cream-muted">
                  {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-cream-muted">{event.location ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    event.published
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-dark-4 text-cream-muted border border-dark-4'
                  }`}>
                    {event.published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <EventActions eventId={event.id} />
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-cream-muted">
                  Aucun événement.{' '}
                  <Link href="/admin/evenements/nouveau" className="text-gold underline">
                    Créer le premier
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
