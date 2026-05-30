import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, readFile, unlink } from 'fs/promises'
import path from 'path'
import { normalizePdf } from '@/lib/normalizePdf'
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

  // arrayBuffer() au lieu de FormData : évite la limite de taille de 4MB imposée par Next.js sur les FormData
  const buffer = Buffer.from(await req.arrayBuffer())
  const filename = `${book.slug}.pdf`

  // La normalisation (Ghostscript) a besoin d'un fichier sur disque : on écrit d'abord en local.
  const dir = path.join(process.cwd(), 'private', 'pdfs')
  await mkdir(dir, { recursive: true })
  const fullPath = path.join(dir, filename)
  await writeFile(fullPath, buffer)
  await normalizePdf(fullPath)

  if (isS3Configured()) {
    // Production : on envoie le PDF normalisé en privé sur S3, puis on nettoie le disque.
    const normalized = await readFile(fullPath)
    await uploadPrivateToS3(privateKey('pdfs', filename), normalized, 'application/pdf')
    await unlink(fullPath).catch(() => {})
  }

  const pdfFile = `/private/pdfs/${filename}`
  await prisma.book.update({ where: { id }, data: { pdfFile } })

  return NextResponse.json({ pdfFile })
}
