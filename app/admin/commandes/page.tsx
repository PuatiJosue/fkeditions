'use client'

import { useEffect, useState } from 'react'

interface Order {
  id: string
  bookTitle: string
  amount: number
  paymentMethod: string
  status: string
  mobilePhone?: string
  mobileOperator?: string
  customerName?: string
  reference?: string
  createdAt: string
  user: { email: string; name?: string }
}

const statusLabel: Record<string, string> = {
  PENDING: 'En attente',
  COMPLETED: 'Complété',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const params = filter !== 'ALL' ? `?status=${filter}` : ''
    const res = await fetch(`/api/admin/orders${params}`)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [filter])

  const handleAction = async (id: string, action: 'validate' | 'reject') => {
    setActionId(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setActionId(null)
    fetchOrders()
  }

  const mmPending = orders.filter(
    (o) => o.paymentMethod === 'MOBILE_MONEY' && o.status === 'PENDING'
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream">Commandes</h1>
          {mmPending.length > 0 && (
            <p className="text-xs text-orange-400 mt-1">
              ⚠ {mmPending.length} Mobile Money en attente de validation
            </p>
          )}
        </div>
        {/* Filters */}
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
              {f === 'ALL' ? 'Toutes' : statusLabel[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-dark-4 text-cream-muted">
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Livre</th>
              <th className="text-left px-4 py-3 font-medium">Paiement</th>
              <th className="text-left px-4 py-3 font-medium">Détails MM</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-right px-4 py-3 font-medium">Montant</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-cream-muted">Chargement...</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-cream-muted">Aucune commande</td></tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className={`border-b border-dark-4 transition-colors ${
                order.status === 'PENDING' && order.paymentMethod === 'MOBILE_MONEY'
                  ? 'bg-orange-500/5'
                  : 'hover:bg-dark-4/30'
              }`}>
                <td className="px-4 py-3">
                  <p className="text-cream-dim">{order.user.name ?? order.customerName ?? '—'}</p>
                  <p className="text-cream-muted text-[10px]">{order.user.email}</p>
                  {order.reference && (
                    <p className="text-gold text-[10px] font-bold tracking-widest mt-0.5">{order.reference}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-cream-dim max-w-[160px] truncate">{order.bookTitle}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    order.paymentMethod === 'STRIPE'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {order.paymentMethod === 'STRIPE' ? 'PayPal' : 'Mobile Money'}
                  </span>
                </td>
                <td className="px-4 py-3 text-cream-muted">
                  {order.mobilePhone ? (
                    <span>{order.mobileOperator} · {order.mobilePhone}</span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gold font-medium">${order.amount}</td>
                <td className="px-4 py-3 text-right">
                  {order.status === 'PENDING' && order.paymentMethod === 'MOBILE_MONEY' && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleAction(order.id, 'validate')}
                        disabled={actionId === order.id}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-[10px] uppercase tracking-wide transition-colors disabled:opacity-50"
                      >
                        ✓ Valider
                      </button>
                      <button
                        onClick={() => handleAction(order.id, 'reject')}
                        disabled={actionId === order.id}
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
