import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import RevenueChart from './RevenueChart'

export default async function AdminDashboard() {
  const [totalUsers, totalOrders, pendingMM, completedOrders, newsletterCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.purchase.count(),
      prisma.purchase.count({ where: { status: 'PENDING', paymentMethod: 'MOBILE_MONEY' } }),
      prisma.purchase.count({ where: { status: 'COMPLETED' } }),
      prisma.newsletterSubscriber.count(),
    ])

  const revenueResult = await prisma.purchase.aggregate({
    _sum: { amount: true },
    where: { status: 'COMPLETED' },
  })
  const revenue = revenueResult._sum.amount ?? 0

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const completedPurchases = await prisma.purchase.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: twelveMonthsAgo } },
    select: { amount: true, createdAt: true },
  })

  const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(twelveMonthsAgo)
    d.setMonth(d.getMonth() + i)
    const year = d.getFullYear()
    const month = d.getMonth()
    const purchases = completedPurchases.filter((p) => {
      const pd = new Date(p.createdAt)
      return pd.getFullYear() === year && pd.getMonth() === month
    })
    return {
      month: monthLabels[month],
      revenue: purchases.reduce((s, p) => s + p.amount, 0),
      orders: purchases.length,
    }
  })

  const recentOrders = await prisma.purchase.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  })

  const stats: Array<{ label: string; value: string | number; tone: string; urgent?: boolean }> = [
    { label: 'Revenus totaux', value: `$${revenue.toFixed(2)}`, tone: 'var(--accent)' },
    { label: 'Commandes complètes', value: completedOrders, tone: '#16a34a' },
    {
      label: 'Mobile Money en attente',
      value: pendingMM,
      tone: pendingMM > 0 ? '#ea580c' : 'var(--ink-mute)',
      urgent: pendingMM > 0,
    },
    { label: 'Utilisateurs inscrits', value: totalUsers, tone: '#2563eb' },
    { label: 'Abonnés newsletter', value: newsletterCount, tone: '#7c3aed' },
    { label: 'Total commandes', value: totalOrders, tone: 'var(--ink)' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <span className="kicker">Vue d&apos;ensemble</span>
        <h1 className="admin-page-title" style={{ marginTop: 12 }}>
          Tableau de <em className="serif-i" style={{ color: 'var(--accent)' }}>bord</em>
        </h1>
        <p className="admin-page-subtitle">FK Éditions — Pilotage de la maison</p>
      </div>

      {pendingMM > 0 && (
        <div
          style={{
            marginBottom: 24,
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1px solid rgba(234, 88, 12, 0.3)',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ color: '#ea580c', fontSize: 24 }}>⚠</span>
          <div>
            <p style={{ fontSize: 14, color: '#ea580c', fontWeight: 600 }}>
              {pendingMM} commande{pendingMM > 1 ? 's' : ''} Mobile Money en attente de validation
            </p>
            <Link
              href="/admin/commandes?filter=pending"
              style={{ fontSize: 12, color: '#ea580c', textDecoration: 'underline' }}
            >
              Valider maintenant →
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="admin-card"
            style={{
              borderColor: stat.urgent ? '#ea580c' : 'var(--line)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ink-mute)',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 32,
                fontWeight: 500,
                color: stat.tone,
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={{ marginBottom: 40 }}>
        <RevenueChart data={chartData} />
      </div>

      {/* Recent orders */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 22,
            color: 'var(--ink)',
            marginBottom: 16,
          }}
        >
          Dernières commandes
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Livre</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.user.email}</td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.bookTitle}
                  </td>
                  <td>
                    <Pill
                      tone={order.paymentMethod === 'STRIPE' ? 'blue' : 'orange'}
                    >
                      {order.paymentMethod === 'STRIPE' ? 'PayPal' : order.mobileOperator ?? 'Mobile Money'}
                    </Pill>
                  </td>
                  <td>
                    <Pill tone={order.status === 'COMPLETED' ? 'green' : order.status === 'PENDING' ? 'orange' : 'red'}>
                      {order.status === 'COMPLETED' ? 'Complété' : order.status === 'PENDING' ? 'En attente' : 'Échoué'}
                    </Pill>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                    ${order.amount}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-mute)' }}
                  >
                    Aucune commande pour l&apos;instant
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Pill({ tone, children }: { tone: 'green' | 'orange' | 'red' | 'blue'; children: React.ReactNode }) {
  const tones = {
    green: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#16a34a' },
    orange: { bg: 'rgba(234, 88, 12, 0.1)', border: 'rgba(234, 88, 12, 0.3)', text: '#ea580c' },
    red: { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.3)', text: '#dc2626' },
    blue: { bg: 'rgba(37, 99, 235, 0.1)', border: 'rgba(37, 99, 235, 0.3)', text: '#2563eb' },
  }
  const cfg = tones[tone]
  return (
    <span
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        padding: '3px 8px',
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  )
}
