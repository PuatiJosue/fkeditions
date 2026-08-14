import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/signedToken'

export async function GET(req: Request, { params }: { params: Promise<{ bookSlug: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const { bookSlug } = await params

  if (!/^[a-z0-9-]+$/.test(bookSlug)) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const isAdmin = session.user.role === 'ADMIN'
  if (!isAdmin) {
    const purchase = await prisma.purchase.findFirst({
      where: { userId: session.user.id, bookSlug, status: 'COMPLETED' },
    })
    if (!purchase) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const book = await prisma.book.findUnique({
    where: { slug: bookSlug },
    select: { epubFile: true, pdfFile: true, pages: true },
  })

  const format = book?.epubFile ? 'epub' : 'pdf'
  const token = createToken(session.user.id, `book:${bookSlug}`)
  return NextResponse.json({ token, format, pages: book?.pages ?? null })
}
