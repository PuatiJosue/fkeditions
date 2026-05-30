import { prisma } from '@/lib/prisma'
import BookForm from '../../livres/BookForm'

export default async function NouveauMagazinePage() {
  const authors = await prisma.author.findMany({ orderBy: { name: 'asc' } })
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Nouveau magazine</h1>
        <p className="text-xs text-cream-muted mt-1">Remplissez les informations du magazine (prix, pré-commande, fichiers…)</p>
      </div>
      <BookForm
        authors={authors.map((a) => ({ id: a.id, name: a.name }))}
        initial={{ isMagazine: true, category: 'Magazine' }}
      />
    </div>
  )
}
