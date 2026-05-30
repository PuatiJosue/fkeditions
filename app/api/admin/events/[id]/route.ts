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
  const event = await prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? null,
      date: new Date(data.date),
      location: data.location ?? null,
      imageUrl: data.imageUrl ?? null,
      published: data.published ?? true,
    },
  })
  return NextResponse.json(event)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
