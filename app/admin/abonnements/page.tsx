'use client'

import { useEffect, useState } from 'react'

interface Sub {
  id: string
  plan: string
  amount: number
  paymentMethod: string
  status: string
  mobilePhone?: string
  mobileOperator?: string
  startDate?: string
  endDate?: string
  createdAt: string
  user: { email: string; name?: string }
}

const planLabel: Record<string, string> = {
  mensuel: '1 mois', trimestriel: '3 mois', semestriel: '6 mois', annuel: '12 mois',
}
const statusLabel: Record<string, string> = {
  PENDING: 'En attente', COMPLETED: 'Actif', FAILED: 'Rejeté',
}

export default function AbonnementsPage() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchSubs = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/subscriptions')
    const data = await res.json()
    setSubs(data.subscriptions ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchSubs() }, [])

  const handleAction = async (id: string, action: 'validate' | 'reject') => {
    setActionId(id)
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setActionId(null)
    fetchSubs()
  }

  const filtered = filter === 'ALL' ? subs : subs.filter(s => s.status === filter)
  const mmPending = subs.filter(s => s.paymentMethod === 'MOBILE_MONEY' && s.status === 'PENDING')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream">Abonnements</h1>
          {mmPending.length > 0 && (
            <p className="text-xs text-orange-400 mt-1">
              ⚠ {mmPending.length} Mobile Money en attente de validation
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'COMPLETED', 'FAILED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-4 py-2 transition-colors ${
                filter === f
                  ? 'bg-gold text-dark font-semibold'
                  : 'border border-dark-4 text-cream-muted hover:border-gold/40 hover:text-cream'
              }`}
            >
              {f === 'ALL' ? 'Tous' : statusLabel[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-dark-4 text-cream-muted">
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Plan</th>
              <th className="text-left px-4 py-3 font-medium">Paiement</th>
              <th className="text-left px-4 py-3 font-medium">Détails MM</th>
              <th className="text-left px-4 py-3 font-medium">Fin d&apos;abonnement</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-right px-4 py-3 font-medium">Montant</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-cream-muted">Chargement...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-cream-muted">Aucun abonnement</td></tr>
            )}
            {filtered.map((sub) => (
              <tr key={sub.id} className={`border-b border-dark-4 transition-colors ${
                sub.status === 'PENDING' && sub.paymentMethod === 'MOBILE_MONEY'
                  ? 'bg-orange-500/5'
                  : 'hover:bg-dark-4/30'
              }`}>
                <td className="px-4 py-3">
                  <p className="text-cream-dim">{sub.user.name ?? '—'}</p>
                  <p className="text-cream-muted text-[10px]">{sub.user.email}</p>
                  <p className="text-gold/60 text-[10px] font-mono mt-0.5">SUB-{sub.id.slice(-6).toUpperCase()}</p>
                </td>
                <td className="px-4 py-3 text-cream-dim">{planLabel[sub.plan] ?? sub.plan}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    sub.paymentMethod === 'MOBILE_MONEY'
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {sub.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'PayPal'}
                  </span>
                </td>
                <td className="px-4 py-3 text-cream-muted">
                  {sub.mobilePhone ? `${sub.mobileOperator} · ${sub.mobilePhone}` : '—'}
                </td>
                <td className="px-4 py-3 text-cream-muted">
                  {sub.endDate
                    ? new Date(sub.endDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    sub.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    sub.status === 'PENDING'   ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {statusLabel[sub.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gold font-medium">${sub.amount}</td>
                <td className="px-4 py-3 text-right">
                  {sub.status === 'PENDING' && sub.paymentMethod === 'MOBILE_MONEY' && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleAction(sub.id, 'validate')}
                        disabled={actionId === sub.id}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-[10px] uppercase tracking-wide transition-colors disabled:opacity-50"
                      >
                        ✓ Valider
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, 'reject')}
                        disabled={actionId === sub.id}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] uppercase tracking-wide transition-colors disabled:opacity-50"
                      >
                        ✕ Rejeter
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
