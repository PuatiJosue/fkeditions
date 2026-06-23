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

function s3KeyFromUrl(url: string | null): string | null {
  if (!url) return null
  const i = url.indexOf('.amazonaws.com/')
  return i === -1 ? null : url.slice(i + '.amazonaws.com/'.length)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params

  const buffer = Buffer.from(await req.arrayBuffer())
  const contentType = req.headers.get('content-type') ?? 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'

  let featuredImage: string

  if (isS3Configured()) {
    const key = `magazines/featured/${id}-${Date.now()}.${ext}`
    featuredImage = await uploadToS3(key, buffer, contentType)

    const existing = await prisma.book.findUnique({ where: { id }, select: { featuredImage: true } })
    const oldKey = s3KeyFromUrl(existing?.featuredImage ?? null)
    if (oldKey && oldKey !== key) await deleteFromS3(oldKey)
  } else {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'featured')
    await mkdir(dir, { recursive: true })
    const filename = `${id}.${ext}`
    await writeFile(path.join(dir, filename), buffer)
    featuredImage = `/uploads/featured/${filename}`
  }

  await prisma.book.update({ where: { id }, data: { featuredImage } })

  return NextResponse.json({ featuredImage })
}
