import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { isS3Configured, uploadPrivateToS3, privateKey } from '@/lib/s3'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params

  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 })

  const buffer = Buffer.from(await req.arrayBuffer())
  const filename = `${book.slug}.epub`

  if (isS3Configured()) {
    // Production : fichier payant stocké en privé sur S3 (inaccessible sans achat).
    await uploadPrivateToS3(privateKey('epubs', filename), buffer, 'application/epub+zip')
  } else {
    // Développement local : disque.
    const dir = path.join(process.cwd(), 'private', 'epubs')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)
  }

  const epubFile = `/private/epubs/${filename}`
  await prisma.book.update({ where: { id }, data: { epubFile } })

  return NextResponse.json({ epubFile })
}
