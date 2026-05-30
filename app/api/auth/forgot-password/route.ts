import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordReset } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import crypto from 'crypto'

export async function POST(req: Request) {
  if (!rateLimit(getClientIp(req), 'forgot-password', { limit: 3, window: 3600 })) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 1 heure.' }, { status: 429 })
  }

  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to avoid user enumeration
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { email } })
    await prisma.passwordResetToken.create({ data: { email, token, expiresAt } })
    await sendPasswordReset(email, token)
  }

  return NextResponse.json({ success: true })
}
