'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import MobileMoneyForm from '@/components/MobileMoneyForm'
import Link from 'next/link'
import { useTheme } from '@/lib/useTheme'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  bookId: string
  bookTitle: string
  price: number
  successParam?: string
  cancelledParam?: string
  preOrder?: boolean
  releaseDate?: string
}

interface CardFormProps {
  bookId: string
  bookTitle: string
  price: number
  preOrder: boolean
  releaseDate?: string
}

function CardForm({ bookId, bookTitle, price, preOrder, releaseDate }: CardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { theme } = useTheme()
  const cardText = theme === 'light' ? '#2a2118' : '#e8dcc8'
  const cardPlaceholder = theme === 'light' ? '#9a8f7d' : '#6b6252'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    fetch('/api/checkout/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookTitle, amount: price, bookSlug: bookId, preOrder, releaseDate }),
    })
      .then(r => r.json())
      .then(d => { if (d.clientSecret) setClientSecret(d.clientSecret) })
  }, [bookTitle, price])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    setLoading(true)
    setError('')

    const card = elements.getElement(CardElement)
    if (!card) return

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Erreur de paiement')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      const res = await fetch('/api/checkout/stripe/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          bookSlug: bookId,
          bookTitle,
          amount: price,
          preOrder,
          releaseDate,
        }),
      })
      const result = await res.json()
      if (result.success) {
        router.push('/bibliotheque')
      } else {
        setError(result.error ?? 'Erreur lors de la confirmation')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="border border-dark-4 bg-dark-3 px-4 py-3">
        <CardElement
          key={theme}
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: cardText,
                fontFamily: 'monospace',
                '::placeholder': { color: cardPlaceholder },
              },
              invalid: { color: '#f87171' },
            },
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400 border border-red-800/40 px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || !clientSecret || loading}
        className="bg-gold hover:bg-gold-light disabled:opacity-50 text-dark font-semibold py-4 text-sm tracking-widest uppercase transition-colors"
      >
        {loading ? 'Traitement...' : `Payer ${price} USD`}
      </button>
      <p className="text-[10px] text-cream-muted/50 text-center">Paiement sécurisé par Stripe · Visa · Mastercard · Amex</p>
    </form>
  )
}

export default function CheckoutSection({
  bookId, bookTitle, price, successParam, cancelledParam, preOrder = false, releaseDate,
}: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'card' | 'mm'>('card')

  if (status === 'loading') return null

  const releaseFmt = releaseDate
    ? new Date(releaseDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
    : 'bientôt'

  return (
    <div className="flex flex-col gap-4">
      {successParam === '1' && (
        <div className="bg-green-900/30 border border-green-600/40 text-green-400 px-4 py-4 space-y-3">
          <p className="text-sm">
            {preOrder
              ? `Pré-commande confirmée ! Votre livre sera disponible le ${releaseFmt}.`
              : 'Paiement réussi ! Votre ebook est maintenant accessible.'}
          </p>
          <p className="text-xs text-green-500">
            Retrouvez votre livre dans votre bibliothèque personnelle.
          </p>
          <Link
            href="/bibliotheque"
            className="inline-block bg-green-700 hover:bg-green-600 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors"
          >
            Accéder à ma bibliothèque →
          </Link>
        </div>
      )}
      {cancelledParam === '1' && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 text-yellow-400 text-sm px-4 py-3">
          Paiement annulé. Vous pouvez réessayer quand vous voulez.
        </div>
      )}

      <div className="flex border border-dark-4">
        {(['card', 'mm'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs tracking-widest uppercase transition-colors ${
              tab === t ? 'bg-gold text-dark font-semibold' : 'text-cream-muted hover:text-cream'
            }`}
          >
            {t === 'card' ? 'Carte bancaire' : 'Mobile Money'}
          </button>
        ))}
      </div>

      {tab === 'card' && (
        <div className="flex flex-col gap-3">
          {preOrder && releaseDate && (
            <div className="bg-gold/10 border border-gold/30 px-3 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gold">Disponible le {releaseFmt}</p>
            </div>
          )}
          {!session ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-cream-muted text-center">Connectez-vous pour payer par carte</p>
              <button
                onClick={() => router.push(`/login?callbackUrl=/livres/${bookId}`)}
                className="bg-gold hover:bg-gold-light text-dark font-semibold py-4 text-sm tracking-widest uppercase transition-colors"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <CardForm bookId={bookId} bookTitle={bookTitle} price={price} preOrder={preOrder} releaseDate={releaseDate} />
            </Elements>
          )}
        </div>
      )}

      {tab === 'mm' && (
        <MobileMoneyForm bookId={bookId} bookTitle={bookTitle} price={price} preOrder={preOrder} />
      )}

      <p className="text-[11px] text-cream-muted/60 text-center leading-relaxed">
        En finalisant votre achat, vous acceptez nos{' '}
        <a href="/cgv" className="underline hover:text-cream-muted transition-colors">Conditions Générales de Vente</a>.
        {' '}Les produits numériques ne sont pas remboursables.
      </p>
    </div>
  )
}
