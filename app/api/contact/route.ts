import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  if (!rateLimit(getClientIp(req), 'contact', { limit: 3, window: 3600 })) {
    return NextResponse.json({ error: 'Trop de messages. Réessayez dans 1 heure.' }, { status: 429 })
  }

  const { name, email, subject, message } = await req.json()

  if (!name || !email || !email.includes('@') || !subject || !message) {
    return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message trop long (max 2000 caractères)' }, { status: 400 })
  }

  await sendContactEmail(name, email, subject, message)

  return NextResponse.json({ success: true })
}
