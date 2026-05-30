import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { bookTitle, amount, bookSlug, preOrder, releaseDate } = await req.json()
  if (!bookTitle || !amount || !bookSlug) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(parseFloat(amount) * 100),
    currency: 'cad',
    description: `FK Éditions — ${bookTitle}`,
    metadata: {
      userId: session.user.id,
      userEmail: session.user.email ?? '',
      bookSlug,
      bookTitle,
      amount: String(amount),
      preOrder: preOrder ? 'true' : 'false',
      releaseDate: releaseDate ?? '',
    },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
