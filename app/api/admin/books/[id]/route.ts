import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  const book = await prisma.book.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      pricePhysical: data.pricePhysical ? parseFloat(data.pricePhysical) : null,
      priceAudio: data.priceAudio ? parseFloat(data.priceAudio) : null,
      category: data.category,
      type: data.type ?? 'EBOOK',
      stock: data.stock ? parseInt(data.stock) : null,
      year: data.year ? parseInt(data.year) : null,
      pages: data.pages ? parseInt(data.pages) : null,
      audioDuration: data.audioDuration ? parseInt(data.audioDuration) : null,
      coverImage: data.coverImage ?? null,
      pdfFile: data.pdfFile ?? null,
      published: data.published ?? true,
      preOrder: data.preOrder ?? false,
      isMagazine: data.isMagazine ?? false,
      tier: data.tier || null,
      featuredName: data.featuredName || null,
      featuredEvent: data.featuredEvent || null,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      content: data.content ?? null,
      coAuthors: data.coAuthors || null,
      authorId: data.authorId || null,
    },
  })
  return NextResponse.json(book)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  await prisma.book.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
