import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma, type BookType, type MagazineTier } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const books = await prisma.book.findMany({
    where: { isMagazine: false },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  })
  return NextResponse.json(books)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  let data: Record<string, unknown>
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide (JSON illisible).' }, { status: 400 })
  }

  // Validation minimale des champs obligatoires (évite les erreurs muettes).
  const price = parseFloat(data.price as string)
  if (!data.slug || !data.title) {
    return NextResponse.json({ error: 'Le titre et le slug sont obligatoires.' }, { status: 400 })
  }
  if (Number.isNaN(price)) {
    return NextResponse.json({ error: 'Le prix ebook est obligatoire et doit être un nombre.' }, { status: 400 })
  }

  try {
    const book = await prisma.book.create({
      data: {
        slug: data.slug as string,
        title: data.title as string,
        description: (data.description as string) ?? '',
        price,
        pricePhysical: data.pricePhysical ? parseFloat(data.pricePhysical as string) : null,
        priceAudio: data.priceAudio ? parseFloat(data.priceAudio as string) : null,
        category: (data.category as string) ?? 'Autre',
        type: (data.type as BookType) ?? 'EBOOK',
        stock: data.stock ? parseInt(data.stock as string) : null,
        year: data.year ? parseInt(data.year as string) : null,
        pages: data.pages ? parseInt(data.pages as string) : null,
        audioDuration: data.audioDuration ? parseInt(data.audioDuration as string) : null,
        coverImage: (data.coverImage as string) ?? null,
        pdfFile: (data.pdfFile as string) ?? null,
        published: (data.published as boolean) ?? true,
        preOrder: (data.preOrder as boolean) ?? false,
        isMagazine: (data.isMagazine as boolean) ?? false,
        tier: (data.tier as MagazineTier) || null,
        featuredName: (data.featuredName as string) || null,
        featuredEvent: (data.featuredEvent as string) || null,
        releaseDate: data.releaseDate ? new Date(data.releaseDate as string) : null,
        content: (data.content as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        coAuthors: (data.coAuthors as string) || null,
        // '' (option « Aucun auteur ») doit devenir null, sinon Prisma cherche
        // un auteur d'id vide → violation de clé étrangère (P2003).
        authorId: (data.authorId as string) || null,
      },
    })
    return NextResponse.json(book, { status: 201 })
  } catch (err) {
    // Slug déjà utilisé → message clair plutôt qu'un 500 vide.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Un livre avec ce slug existe déjà. Choisissez-en un autre.' }, { status: 409 })
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      return NextResponse.json({ error: "L'auteur sélectionné n'existe pas (ou n'est plus valide). Choisissez-en un autre." }, { status: 400 })
    }
    console.error('[POST /api/admin/books] échec de création :', err)
    const message = err instanceof Error ? err.message : 'Erreur lors de la création du livre.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
