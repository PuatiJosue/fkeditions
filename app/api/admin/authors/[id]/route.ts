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
  const author = await prisma.author.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      role: data.role ?? 'Auteur',
      bio: data.bio ?? null,
      photo: data.photo ?? null,
      facebook: data.facebook ?? null,
      instagram: data.instagram ?? null,
    },
  })
  return NextResponse.json(author)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  await prisma.author.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
