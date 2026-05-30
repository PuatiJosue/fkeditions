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
  const events = await prisma.event.findMany({ orderBy: { date: 'desc' } })
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const data = await req.json()
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      date: new Date(data.date),
      location: data.location ?? null,
      imageUrl: data.imageUrl ?? null,
      published: data.published ?? true,
    },
  })
  return NextResponse.json(event, { status: 201 })
}
