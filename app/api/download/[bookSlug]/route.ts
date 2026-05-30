import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path, { resolve } from 'path'
import { existsSync } from 'fs'
import { verifyToken } from '@/lib/signedToken'
import { getObjectFromS3, privateKey } from '@/lib/s3'

export async function GET(req: Request, { params }: { params: Promise<{ bookSlug: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { bookSlug } = await params
  const token = new URL(req.url).searchParams.get('token')
  if (!session.user.role || session.user.role !== 'ADMIN') {
    if (!token || !verifyToken(token, session.user.id, `book:${bookSlug}`)) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 403 })
    }
  }

  if (!/^[a-z0-9-]+$/.test(bookSlug)) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const isAdmin = session.user.role === 'ADMIN'

  if (!isAdmin) {
    const purchase = await prisma.purchase.findFirst({
      where: { userId: session.user.id, bookSlug, status: 'COMPLETED' },
    })
    if (!purchase) {
      return NextResponse.json({ error: 'Accès refusé — achetez ce livre pour y accéder' }, { status: 403 })
    }
  }

  const book = await prisma.book.findUnique({ where: { slug: bookSlug } })
  if (!book) return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 })

  // Servir ePub en priorité, sinon PDF. On tente S3 (stockage permanent privé),
  // sinon on lit le disque (anciens fichiers non encore migrés).
  if (book.epubFile) {
    const fileName = path.basename(book.epubFile)
    const buffer = await readPrivate('epubs', fileName)
    if (!buffer) return NextResponse.json({ error: 'Fichier introuvable — contactez le support' }, { status: 404 })
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `inline; filename="${book.slug}.epub"`,
        'Cache-Control': 'no-store, no-cache, private',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  if (book.pdfFile) {
    const fileName = path.basename(book.pdfFile)
    const buffer = await readPrivate('pdfs', fileName)
    if (!buffer) return NextResponse.json({ error: 'Fichier PDF introuvable — contactez le support' }, { status: 404 })
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${book.slug}.pdf"`,
        'Cache-Control': 'no-store, no-cache, private',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  return NextResponse.json({ error: 'Fichier non disponible pour ce livre' }, { status: 404 })
}

/** Lit un fichier privé : S3 en priorité, sinon disque (rétro-compatibilité). */
async function readPrivate(subdir: string, fileName: string) {
  const s3 = await getObjectFromS3(privateKey(subdir, fileName))
  if (s3) return s3.buffer

  const basePath = resolve(process.cwd(), 'private', subdir)
  const filePath = resolve(basePath, fileName)
  if (!filePath.startsWith(basePath)) return null
  if (!existsSync(filePath)) return null
  return readFile(filePath)
}
