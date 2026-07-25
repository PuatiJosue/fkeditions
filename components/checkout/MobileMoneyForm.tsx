'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Operator {
  value: string
  label: string
  number: string
  prefixes: string[]
  placeholder: string
}

function buildOperators(mpesa: string, airtel: string): Operator[] {
  return [
    { value: 'M_PESA', label: 'M-Pesa',       number: mpesa,  prefixes: ['081', '082'], placeholder: 'ex: 0810000000 ou 0820000000' },
    { value: 'AIRTEL', label: 'Airtel Money', number: airtel, prefixes: ['099'],        placeholder: 'ex: 0990000000' },
  ]
}

const DEFAULT_OPERATORS = buildOperators('0829082048', '0991316128')

interface Props {
  bookId: string
  bookTitle: string
  price: number
  preOrder?: boolean
}

export default function MobileMoneyForm({ bookId, bookTitle, price, preOrder = false }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState('M_PESA')
  const [operators, setOperators] = useState<Operator[]>(DEFAULT_OPERATORS)
  const activeOperator = operators.find((o) => o.value === operator)!

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setOperators(
          buildOperators(
            data.mpesa_number || '0829082048',
            data.airtel_number || '0991316128'
          )
        )
      })
      .catch(() => {})
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reference, setReference] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) {
      router.push(`/login?callbackUrl=/livres/${bookId}`)
      return
    }
    if (!phone.trim()) { setError('Veuillez entrer votre numéro de téléphone'); return }
    const matchesOperator = activeOperator.prefixes.some(p => phone.trim().startsWith(p))
    if (!matchesOperator) {
      setError(`Un numéro ${activeOperator.label} doit commencer par ${activeOperator.prefixes.join(' ou ')}`)
      setLoading(false)
      return
    }
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/checkout/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookSlug: bookId,
          bookTitle,
          amount: price,
          mobilePhone: phone.trim(),
          mobileOperator: operator,
          customerName: session.user?.name ?? session.user?.email ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur Mobile Money')
      setSuccess(data.message)
      setReference(data.reference ?? '')
      setPhone('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-xs text-cream-muted">Disponible à Kinshasa — M-Pesa (081/082), Airtel Money (099)</p>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Opérateur</label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="bg-dark-2 border border-dark-4 text-cream text-sm px-3 py-2.5 focus:outline-none focus:border-gold/50"
        >
          {operators.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Numéro de téléphone</label>
        <input
          type="text"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={activeOperator.placeholder}
          className="bg-dark-2 border border-dark-4 text-cream text-sm px-3 py-2.5 placeholder:text-cream-muted/50 focus:outline-none focus:border-gold/50"
        />
      </div>

      {error && <p className="text-xs text-red-400 border border-red-800/40 px-3 py-2">{error}</p>}
      {success && (
        <div className="bg-green-900/30 border border-green-600/40 text-green-400 text-xs px-3 py-3 leading-relaxed space-y-1">
          <p>{success}</p>
          {reference && (
            <p>Votre référence :{' '}
              <span className="font-bold text-gold text-sm tracking-widest">{reference}</span>
              {' '}— Gardez-la précieusement.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-gold hover:bg-gold-light disabled:opacity-60 text-dark font-semibold py-4 text-sm tracking-widest uppercase transition-colors"
      >
        {loading ? 'Envoi...' : preOrder ? `Pré-commander — ${price} $` : `Confirmer — ${price} $`}
      </button>

      <div
        style={{
          background: 'var(--accent-soft)',
          border: '2px solid var(--accent)',
          padding: 16,
          color: 'var(--accent-deep)',
          lineHeight: 1.5,
        }}
      >
        <p style={{ fontSize: 13 }}>
          Après confirmation, envoyez <strong>{price} $</strong> via{' '}
          <strong>{activeOperator.label}</strong> au numéro FK Éditions :
        </p>
        <div
          style={{
            margin: '12px 0',
            padding: '12px 16px',
            background: 'var(--paper)',
            border: '1px dashed var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(22px, 4vw, 30px)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--accent)',
            }}
          >
            {activeOperator.number}
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(activeOperator.number)
            }}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 4,
            }}
            title="Copier le numéro"
          >
            📋 Copier
          </button>
        </div>
        <p style={{ fontSize: 12, opacity: 0.85 }}>
          Votre commande sera validée sous 24h.
        </p>
      </div>

      {!session && (
        <p className="text-xs text-cream-muted text-center">Vous serez invité à vous connecter avant le paiement</p>
      )}
    </form>
  )
}
