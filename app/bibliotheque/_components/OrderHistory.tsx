/** Ligne de commande affichée dans l'historique. */
export type OrderRow = {
  id: string
  bookTitle: string
  paymentMethod: string
  mobileOperator: string | null
  status: string
  createdAt: Date | string
  amount: number
}

const HEADERS = ['Livre', 'Méthode', 'Statut', 'Date', 'Montant']

function StatusPill({ status }: { status: string }) {
  const cfg =
    status === 'COMPLETED'
      ? { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#16a34a', label: 'Complété' }
      : status === 'PENDING'
      ? { bg: 'rgba(234, 88, 12, 0.1)', border: 'rgba(234, 88, 12, 0.3)', text: '#ea580c', label: 'En attente' }
      : { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.3)', text: '#dc2626', label: 'Échoué' }
  return (
    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, padding: '4px 10px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
      {cfg.label}
    </span>
  )
}

export function OrderHistoryTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-mute)' }}>
            {HEADERS.map((h, i) => (
              <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '14px 16px', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '14px 16px', color: 'var(--ink)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.bookTitle}
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--ink-soft)' }}>
                {p.paymentMethod === 'STRIPE' ? 'Carte bancaire' : `Mobile Money${p.mobileOperator ? ` (${p.mobileOperator})` : ''}`}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <StatusPill status={p.status} />
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--ink-soft)' }}>
                {new Date(p.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                ${p.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
