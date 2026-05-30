'use client'

interface MonthData {
  month: string
  revenue: number
  orders: number
}

export default function RevenueChart({ data }: { data: MonthData[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  const total = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="bg-dark-3 border border-dark-4 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-cream uppercase tracking-widest">
            Revenus mensuels
          </h2>
          <p className="text-xs text-cream-muted mt-0.5">12 derniers mois</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-2xl text-gold font-bold">${total.toFixed(2)}</p>
          <p className="text-xs text-cream-muted">Total période</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1.5 h-36 mb-2">
        {data.map((d, i) => {
          const heightPct = max > 0 ? Math.max((d.revenue / max) * 100, d.revenue > 0 ? 4 : 0) : 0
          const isLast = i === data.length - 1
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-2 border border-dark-4 px-2 py-1 text-[10px] text-cream whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="text-gold font-semibold">${d.revenue.toFixed(2)}</p>
                <p className="text-cream-muted">{d.orders} commande{d.orders !== 1 ? 's' : ''}</p>
              </div>
              {/* Bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                <div
                  className={`w-full transition-all duration-500 ${isLast ? 'bg-gold' : 'bg-gold/40 group-hover:bg-gold/70'}`}
                  style={{ height: `${heightPct}%`, minHeight: d.revenue > 0 ? '3px' : '0' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Month labels */}
      <div className="flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] text-cream-muted uppercase">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
