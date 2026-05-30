import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import BookActions from './BookActions'

export default async function AdminLivresPage() {
  const [books, authors] = await Promise.all([
    prisma.book.findMany({
      where: { isMagazine: false },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream">Livres</h1>
          <p className="text-xs text-cream-muted mt-1">{books.length} titre{books.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/livres/nouveau"
          className="bg-gold hover:bg-gold-light text-dark text-xs font-semibold px-4 py-2.5 uppercase tracking-widest transition-colors"
        >
          + Ajouter un livre
        </Link>
      </div>

      <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dark-4 text-cream-muted">
              <th className="text-left px-4 py-3 font-medium">Titre</th>
              <th className="text-left px-4 py-3 font-medium">Auteur</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Prix</th>
              <th className="text-left px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b border-dark-4 hover:bg-dark-4/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-cream-dim font-medium max-w-xs truncate">{book.title}</p>
                  <p className="text-cream-muted text-[10px] mt-0.5">{book.category}</p>
                </td>
                <td className="px-4 py-3 text-cream-muted">{book.author?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    book.type === 'EBOOK'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  }`}>
                    {book.type === 'EBOOK' ? 'Ebook' : 'Physique'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gold font-medium">${book.price}</td>
                <td className="px-4 py-3 text-cream-muted">
                  {book.type === 'PHYSICAL' ? (book.stock ?? 0) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    book.published
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-dark-4 text-cream-muted border border-dark-4'
                  }`}>
                    {book.published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <BookActions bookId={book.id} bookSlug={book.slug} hasPdf={!!book.pdfFile} hasEpub={!!book.epubFile} />
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-cream-muted">
                  Aucun livre.{' '}
                  <Link href="/admin/livres/nouveau" className="text-gold underline">
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
