'use client'

import { useState, useEffect } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTheme } from '@/lib/useTheme'

type Props = { planId: string; price: number; onSuccess: () => void }

/** Formulaire de paiement Stripe pour un abonnement FLYSYS. */
export default function SubscriptionCardForm({ planId, price, onSuccess }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const { theme } = useTheme()
  const cardText = theme === 'light' ? '#2a2118' : '#e8dcc8'
  const cardPlaceholder = theme === 'light' ? '#9a8f7d' : '#6b6252'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    fetch('/api/checkout/stripe/create-subscription-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    }).then((r) => r.json()).then((d) => { if (d.clientSecret) setClientSecret(d.clientSecret) })
  }, [planId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    setLoading(true); setError('')
    const card = elements.getElement(CardElement)
    if (!card) return
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    if (stripeError) { setError(stripeError.message ?? 'Erreur de paiement'); setLoading(false); return }
    if (paymentIntent?.status === 'succeeded') {
      const res = await fetch('/api/checkout/stripe/capture-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id, planId }),
      })
      const result = await res.json()
      if (result.success) onSuccess()
      else setError(result.error ?? 'Erreur de confirmation')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="border border-dark-4 bg-dark-2 px-3 py-2.5">
        <CardElement key={theme} options={{ style: { base: { fontSize: '13px', color: cardText, fontFamily: 'monospace', '::placeholder': { color: cardPlaceholder } }, invalid: { color: '#f87171' } } }} />
      </div>
      {error && <p className="text-[10px] text-red-400 border border-red-800/40 px-2 py-1.5">{error}</p>}
      <button type="submit" disabled={!stripe || !clientSecret || loading}
        className="bg-gold hover:bg-gold-light disabled:opacity-50 text-dark font-semibold py-2.5 text-[10px] tracking-widest uppercase transition-colors">
        {loading ? 'Traitement...' : `Payer ${price} USD`}
      </button>
      <p className="text-[9px] text-cream-muted/50 text-center">Visa · Mastercard · Amex</p>
    </form>
  )
}
