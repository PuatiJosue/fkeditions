import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile, stat } from 'fs/promises'
import path, { resolve } from 'path'
import { existsSync } from 'fs'
import { getObjectFromS3, privateKey } from '@/lib/s3'

export async function GET(req: Request, { params }: { params: Promise<{ bookSlug: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { bookSlug } = await params
  if (!/^[a-z0-9-]+$/.test(bookSlug)) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const isAdmin = session.user.role === 'ADMIN'

  if (!isAdmin) {
    const purchase = await prisma.purchase.findFirst({
      where: { userId: session.user.id, bookSlug, status: 'COMPLETED' },
    })
    if (!purchase) {
      return NextResponse.json({ error: 'Accès refusé — achetez ce livre audio pour y accéder' }, { status: 403 })
    }
  }

  const book = await prisma.book.findUnique({ where: { slug: bookSlug } })
  if (!book) return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 })
  if (!book.audioFile) {
    return NextResponse.json({ error: 'Audio non disponible pour ce livre' }, { status: 404 })
  }

  const fileName = path.basename(book.audioFile)
  const ext = path.extname(fileName).toLowerCase().replace('.', '') || 'mpeg'
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg',
    mpeg: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
  }
  const contentType = mimeMap[ext] || 'audio/mpeg'
  // Streaming only — no downloadable file disposition (anti-piracy)
  const disposition = `inline; filename="${book.slug}.${ext}"`
  const rangeHeader = req.headers.get('range')

  // Production : depuis S3 (stockage privé permanent), avec support du Range.
  const s3 = await getObjectFromS3(privateKey('audios', fileName), rangeHeader ?? undefined)
  if (s3) {
    if (rangeHeader && s3.contentRange) {
      return new NextResponse(s3.buffer, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(s3.contentLength),
          'Content-Range': s3.contentRange,
          'Accept-Ranges': 'bytes',
          'Content-Disposition': disposition,
          'Cache-Control': 'no-store, no-cache, private',
        },
      })
    }
    return new NextResponse(s3.buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(s3.contentLength),
        'Accept-Ranges': 'bytes',
        'Content-Disposition': disposition,
        'Cache-Control': 'no-store, no-cache, private',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  // Repli disque (anciens fichiers non migrés)
  const basePath = resolve(process.cwd(), 'private', 'audios')
  const filePath = resolve(basePath, fileName)
  if (!filePath.startsWith(basePath) || !existsSync(filePath)) {
    return NextResponse.json({ error: 'Fichier audio introuvable — contactez le support' }, { status: 404 })
  }

  const fileStat = await stat(filePath)
  const totalSize = fileStat.size

  if (rangeHeader) {
    const match = /bytes=(\d+)-(\d+)?/.exec(rangeHeader)
    if (match) {
      const start = parseInt(match[1], 10)
      const end = match[2] ? parseInt(match[2], 10) : totalSize - 1
      const chunkSize = end - start + 1
      const fileBuffer = await readFile(filePath)
      const chunk = fileBuffer.slice(start, end + 1)
      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(chunkSize),
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Disposition': disposition,
          'Cache-Control': 'no-store, no-cache, private',
        },
      })
    }
  }

  const fileBuffer = await readFile(filePath)
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(totalSize),
      'Accept-Ranges': 'bytes',
      'Content-Disposition': disposition,
      'Cache-Control': 'no-store, no-cache, private',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
