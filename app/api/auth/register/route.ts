import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  // Max 5 inscriptions par IP par heure
  if (!rateLimit(getClientIp(req), 'register', { limit: 5, window: 3600 })) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 1 heure.' }, { status: 429 })
  }

  const { email, password, name } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
    select: { id: true, email: true, name: true },
  })

  sendWelcomeEmail(user.email, user.name ?? undefined).catch(() => {})

  return NextResponse.json({ user }, { status: 201 })
}
