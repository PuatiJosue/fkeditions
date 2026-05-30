import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { isS3Configured, uploadToS3, deleteFromS3 } from '@/lib/s3'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

/** Extrait la clé S3 d'une URL publique S3, sinon null. */
function s3KeyFromUrl(url: string | null): string | null {
  if (!url) return null
  const i = url.indexOf('.amazonaws.com/')
  return i === -1 ? null : url.slice(i + '.amazonaws.com/'.length)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params

  // arrayBuffer() au lieu de FormData : évite la limite de taille de 4MB imposée par Next.js sur les FormData
  const buffer = Buffer.from(await req.arrayBuffer())
  const contentType = req.headers.get('content-type') ?? 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'

  let coverImage: string

  if (isS3Configured()) {
    // Production : stockage permanent sur Amazon S3.
    const key = `books/${id}-${Date.now()}.${ext}`
    coverImage = await uploadToS3(key, buffer, contentType)

    // Nettoyage : supprime l'ancienne couverture S3 si elle existait.
    const existing = await prisma.book.findUnique({ where: { id }, select: { coverImage: true } })
    const oldKey = s3KeyFromUrl(existing?.coverImage ?? null)
    if (oldKey && oldKey !== key) await deleteFromS3(oldKey)
  } else {
    // Développement local (sans S3) : stockage sur le disque dans public/.
    const dir = path.join(process.cwd(), 'public', 'uploads', 'books')
    await mkdir(dir, { recursive: true })
    const filename = `${id}.${ext}`
    await writeFile(path.join(dir, filename), buffer)
    coverImage = `/uploads/books/${filename}`
  }

  await prisma.book.update({ where: { id }, data: { coverImage } })

  return NextResponse.json({ coverImage })
}
