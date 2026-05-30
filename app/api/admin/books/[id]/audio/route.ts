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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  const { id } = await params

  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 })

  const contentType = req.headers.get('content-type') || 'audio/mpeg'
  let ext = 'mp3'
  if (contentType.includes('mp4') || contentType.includes('m4a')) ext = 'm4a'
  else if (contentType.includes('aac')) ext = 'aac'
  else if (contentType.includes('ogg')) ext = 'ogg'
  else if (contentType.includes('wav')) ext = 'wav'

  const buffer = Buffer.from(await req.arrayBuffer())
  const filename = `${book.slug}.${ext}`

  if (isS3Configured()) {
    await uploadPrivateToS3(privateKey('audios', filename), buffer, contentType)
  } else {
    const dir = path.join(process.cwd(), 'private', 'audios')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)
  }

  const audioFile = `/private/audios/${filename}`
  await prisma.book.update({ where: { id }, data: { audioFile } })

  return NextResponse.json({ audioFile })
}
