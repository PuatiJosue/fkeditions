import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import BookActions from '../livres/BookActions'

export default async function AdminMagazinePage() {
  const magazines = await prisma.book.findMany({
    where: { isMagazine: true },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream">Magazines</h1>
          <p className="text-xs text-cream-muted mt-1">{magazines.length} magazine{magazines.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/magazine/nouveau"
          className="bg-gold hover:bg-gold-light text-dark text-xs font-semibold px-4 py-2.5 uppercase tracking-widest transition-colors"
        >
          + Ajouter un magazine
        </Link>
      </div>

      <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dark-4 text-cream-muted">
              <th className="text-left px-4 py-3 font-medium">Titre</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Prix</th>
              <th className="text-left px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {magazines.map((mag) => (
              <tr key={mag.id} className="border-b border-dark-4 hover:bg-dark-4/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-cream-dim font-medium max-w-xs truncate">{mag.title}</p>
                    {mag.tier && (
                      <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${
                        mag.tier === 'GOLD'
                          ? 'bg-gold/15 text-gold border border-gold/40'
                          : 'bg-dark-4 text-cream-muted border border-dark-4'
                      }`}>
                        {mag.tier === 'GOLD' ? 'Gold' : 'Premium'}
                      </span>
                    )}
                  </div>
                  <p className="text-cream-muted text-[10px] mt-0.5">
                    {mag.featuredName ? `${mag.featuredName} · ` : ''}{mag.preOrder ? 'Pré-commande' : mag.category}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    mag.type === 'EBOOK'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  }`}>
                    {mag.type === 'EBOOK' ? 'Numérique' : 'Physique'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gold font-medium">${mag.price}</td>
                <td className="px-4 py-3 text-cream-muted">
                  {mag.type === 'PHYSICAL' ? (mag.stock ?? 0) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    mag.published
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-dark-4 text-cream-muted border border-dark-4'
                  }`}>
                    {mag.published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <BookActions bookId={mag.id} bookSlug={mag.slug} hasPdf={!!mag.pdfFile} hasEpub={!!mag.epubFile} editBase="/admin/magazine" />
                </td>
              </tr>
            ))}
            {magazines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-cream-muted">
                  Aucun magazine.{' '}
                  <Link href="/admin/magazine/nouveau" className="text-gold underline">
                    Ajouter le premier
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
