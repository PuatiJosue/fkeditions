import { prisma } from '@/lib/prisma'
import BookForm from '../BookForm'

export default async function NouveauLivrePage() {
  const authors = await prisma.author.findMany({ orderBy: { name: 'asc' } })
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Nouveau livre</h1>
        <p className="text-xs text-cream-muted mt-1">Remplissez les informations du livre</p>
      </div>
      <BookForm authors={authors.map((a) => ({ id: a.id, name: a.name }))} />
    </div>
  )
}
