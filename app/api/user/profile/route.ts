import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatar: true, role: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { name, email, currentPassword, newPassword } = await req.json()

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const updates: { name?: string; email?: string; password?: string } = {}

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
    updates.name = name.trim()
  }

  if (email !== undefined && email !== user.email) {
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    if (!currentPassword) {
      return NextResponse.json({ error: 'Mot de passe requis pour changer l\'email' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }
    updates.email = email
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Nouveau mot de passe min. 8 caractères' }, { status: 400 })
    }
    updates.password = await bcrypt.hash(newPassword, 12)
  }

  const updated = await prisma.user.update({ where: { id: session.user.id }, data: updates })

  return NextResponse.json({ success: true, name: updated.name, email: updated.email })
}
