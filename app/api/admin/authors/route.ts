import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const authors = await prisma.author.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { books: true } } },
  })
  return NextResponse.json(authors)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const data = await req.json()
  const author = await prisma.author.create({
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
  return NextResponse.json(author, { status: 201 })
}
