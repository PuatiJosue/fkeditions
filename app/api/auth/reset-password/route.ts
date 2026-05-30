import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'Données invalides (mot de passe min. 8 caractères)' }, { status: 400 })
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email: record.email }, data: { password: hashed } })
  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ success: true })
}
