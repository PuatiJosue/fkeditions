import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

// PATCH — approve/reject a comment
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const approved = typeof body.approved === 'boolean' ? body.approved : null

  if (approved === null) {
    return NextResponse.json({ error: 'Missing approved field' }, { status: 400 })
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { approved },
  })

  return NextResponse.json({ success: true, comment })
}

// DELETE — remove a comment
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.comment.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
