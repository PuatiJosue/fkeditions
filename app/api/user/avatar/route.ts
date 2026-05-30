import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('avatar') as File | null

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image trop grande (maximum 2 Mo).' }, { status: 400 })
  }

  const filename = `${session.user.id}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  await mkdir(uploadDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

  const avatarUrl = `/uploads/avatars/${filename}`
  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar: avatarUrl },
  })

  return NextResponse.json({ success: true, avatar: avatarUrl })
}
