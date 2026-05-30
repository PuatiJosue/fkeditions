import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPayPalOrder } from '@/lib/paypal'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { bookTitle, amount } = await req.json()
  if (!bookTitle || !amount) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const order = await createPayPalOrder(amount, `FK Éditions — ${bookTitle}`)

  if (order.id) {
    return NextResponse.json({ orderId: order.id })
  }

  return NextResponse.json({ error: 'Erreur PayPal' }, { status: 500 })
}
