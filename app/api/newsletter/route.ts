import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterConfirmation } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  // Max 3 inscriptions par IP par heure
  if (!rateLimit(getClientIp(req), 'newsletter', { limit: 3, window: 3600 })) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
  }

  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  if (!existing) {
    await sendNewsletterConfirmation(email)
  }

  return NextResponse.json({ success: true })
}
