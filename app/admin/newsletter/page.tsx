import { prisma } from '@/lib/prisma'

export default async function NewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream">Newsletter</h1>
          <p className="text-xs text-cream-muted mt-1">
            {subscribers.length} abonné{subscribers.length > 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/api/admin/newsletter/export"
          className="bg-dark-3 border border-dark-4 hover:border-gold/40 text-cream-muted hover:text-gold text-xs px-4 py-2.5 uppercase tracking-widest transition-colors"
        >
          Exporter CSV
        </a>
      </div>

      <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dark-4 text-cream-muted">
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub, i) => (
              <tr key={sub.id} className="border-b border-dark-4 hover:bg-dark-4/30 transition-colors">
                <td className="px-4 py-3 text-cream-muted">{i + 1}</td>
                <td className="px-4 py-3 text-cream-dim">{sub.email}</td>
                <td className="px-4 py-3 text-cream-muted">
                  {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-cream-muted">
                  Aucun abonné pour l&apos;instant
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
