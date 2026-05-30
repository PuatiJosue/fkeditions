import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id } = await params
  const issue = await prisma.revueIssue.findUnique({ where: { id } })
  if (!issue) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(issue)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id } = await params
  const data = await req.json()

  const issue = await prisma.revueIssue.update({
    where: { id },
    data: {
      published: data.published,
      title: data.title,
      description: data.description,
      month: data.month,
      year: data.year,
    },
  })

  return NextResponse.json(issue)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id } = await params
  await prisma.revueIssue.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
