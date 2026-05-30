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
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const issues = await prisma.revueIssue.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
  return NextResponse.json(issues)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { title, month, year, description, published } = await req.json()

  if (!title || !month || !year) {
    return NextResponse.json({ error: 'Titre, mois et année requis' }, { status: 400 })
  }

  const issue = await prisma.revueIssue.create({
    data: { title, month: parseInt(month), year: parseInt(year), description: description || null, published: !!published },
  })

  return NextResponse.json(issue)
}
