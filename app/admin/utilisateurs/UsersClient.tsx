'use client'

import { useState, useMemo } from 'react'

export interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  avatar: string | null
  purchaseCount: number
  commentCount: number
  blocked: boolean
  blockedReason: string | null
  blockedAt: string | null
  deletedAt: string | null
  createdAt: string
}

type FilterKey = 'all' | 'active' | 'blocked' | 'suspended' | 'admin'

function StatusPill({ user }: { user: UserRow }) {
  if (user.deletedAt) {
    return <Pill bg="rgba(127, 29, 29, 0.1)" border="rgba(127, 29, 29, 0.4)" color="#7f1d1d">Suspendu</Pill>
  }
  if (user.blocked) {
    return <Pill bg="rgba(234, 88, 12, 0.1)" border="rgba(234, 88, 12, 0.3)" color="#ea580c">Bloqué</Pill>
  }
  if (user.role === 'ADMIN') {
    return <Pill bg="var(--accent-soft)" border="var(--accent)" color="var(--accent-deep)">Admin</Pill>
  }
  return <Pill bg="rgba(34, 197, 94, 0.1)" border="rgba(34, 197, 94, 0.3)" color="#16a34a">Actif</Pill>
}

function Pill({ bg, border, color, children }: { bg: string; border: string; color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
        padding: '3px 10px',
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 700,
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}

export default function UsersClient({ initial }: { initial: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initial)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => !u.blocked && !u.deletedAt && u.role !== 'ADMIN').length,
      blocked: users.filter((u) => u.blocked).length,
      suspended: users.filter((u) => u.deletedAt).length,
      admin: users.filter((u) => u.role === 'ADMIN').length,
    }),
    [users]
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return users.filter((u) => {
      if (filter === 'active' && (u.blocked || u.deletedAt || u.role === 'ADMIN')) return false
      if (filter === 'blocked' && !u.blocked) return false
      if (filter === 'suspended' && !u.deletedAt) return false
      if (filter === 'admin' && u.role !== 'ADMIN') return false
      if (q && !u.email.toLowerCase().includes(q) && !(u.name ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [users, filter, query])

  async function blockUser(id: string) {
    const reason = prompt('Raison du blocage (optionnelle) :')
    if (reason === null) return // cancelled
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Erreur')
        return
      }
      setUsers((us) =>
        us.map((u) => (u.id === id ? { ...u, blocked: true, blockedReason: reason || null, blockedAt: new Date().toISOString() } : u))
      )
    } finally {
      setBusy(null)
    }
  }

  async function unblockUser(id: string) {
    if (!confirm('Débloquer cet utilisateur ?')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/block`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Erreur')
        return
      }
      setUsers((us) =>
        us.map((u) => (u.id === id ? { ...u, blocked: false, blockedReason: null, blockedAt: null } : u))
      )
    } finally {
      setBusy(null)
    }
  }

  async function suspendUser(id: string) {
    if (!confirm('Suspendre ce compte ? Le compte sera désactivé mais les données conservées (achats, etc.). Réversible.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Erreur')
        return
      }
      setUsers((us) => us.map((u) => (u.id === id ? { ...u, deletedAt: new Date().toISOString() } : u)))
    } finally {
      setBusy(null)
    }
  }

  async function restoreUser(id: string) {
    if (!confirm('Réactiver ce compte ?')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Erreur')
        return
      }
      setUsers((us) => us.map((u) => (u.id === id ? { ...u, deletedAt: null } : u)))
    } finally {
      setBusy(null)
    }
  }

  async function toggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
    if (!confirm(`Changer le rôle en ${newRole === 'ADMIN' ? 'Administrateur' : 'Client'} ?`)) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Erreur')
        return
      }
      setUsers((us) => us.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="kicker">Gestion des comptes</span>
        <h1 className="admin-page-title" style={{ marginTop: 12 }}>
          Utilisateurs
        </h1>
        <p className="admin-page-subtitle">
          {counts.all} compte{counts.all > 1 ? 's' : ''}
          {counts.blocked > 0 && ` · ${counts.blocked} bloqué${counts.blocked > 1 ? 's' : ''}`}
          {counts.suspended > 0 && ` · ${counts.suspended} suspendu${counts.suspended > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par email ou nom…"
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '10px 14px',
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* Filter tabs */}
      <div className="section-tabs" style={{ marginTop: 0, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`tab ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>
          Tous ({counts.all})
        </button>
        <button className={`tab ${filter === 'active' ? 'is-active' : ''}`} onClick={() => setFilter('active')}>
          Actifs ({counts.active})
        </button>
        <button className={`tab ${filter === 'blocked' ? 'is-active' : ''}`} onClick={() => setFilter('blocked')}>
          🟠 Bloqués ({counts.blocked})
        </button>
        <button className={`tab ${filter === 'suspended' ? 'is-active' : ''}`} onClick={() => setFilter('suspended')}>
          🔴 Suspendus ({counts.suspended})
        </button>
        <button className={`tab ${filter === 'admin' ? 'is-active' : ''}`} onClick={() => setFilter('admin')}>
          Admins ({counts.admin})
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Statut</th>
              <th style={{ textAlign: 'center' }}>Achats</th>
              <th style={{ textAlign: 'center' }}>Commentaires</th>
              <th>Inscrit le</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ opacity: u.deletedAt ? 0.6 : 1 }}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
                      {u.name || '—'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{u.email}</span>
                    {u.blocked && u.blockedReason && (
                      <span style={{ fontSize: 11, color: '#ea580c', fontStyle: 'italic', marginTop: 4 }}>
                        ⚠ {u.blockedReason}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <StatusPill user={u} />
                </td>
                <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>{u.purchaseCount}</td>
                <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>{u.commentCount}</td>
                <td style={{ color: 'var(--ink-mute)', fontSize: 12 }}>
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {u.role !== 'ADMIN' && (
                      <>
                        {!u.blocked && !u.deletedAt && (
                          <ActionBtn onClick={() => blockUser(u.id)} disabled={busy === u.id} color="#ea580c">
                            🟠 Bloquer
                          </ActionBtn>
                        )}
                        {u.blocked && (
                          <ActionBtn onClick={() => unblockUser(u.id)} disabled={busy === u.id} color="#16a34a">
                            ✓ Débloquer
                          </ActionBtn>
                        )}
                        {!u.deletedAt && (
                          <ActionBtn onClick={() => suspendUser(u.id)} disabled={busy === u.id} color="#7f1d1d">
                            🔴 Suspendre
                          </ActionBtn>
                        )}
                        {u.deletedAt && (
                          <ActionBtn onClick={() => restoreUser(u.id)} disabled={busy === u.id} color="#16a34a">
                            ↺ Réactiver
                          </ActionBtn>
                        )}
                      </>
                    )}
                    <ActionBtn onClick={() => toggleRole(u.id, u.role)} disabled={busy === u.id} color="var(--accent)">
                      {u.role === 'ADMIN' ? '↓ Retirer admin' : '↑ Promouvoir admin'}
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-mute)' }}>
                  Aucun utilisateur dans cette catégorie
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActionBtn({
  onClick,
  disabled,
  color,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  color: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 10px',
        background: 'transparent',
        border: `1px solid ${color}`,
        color,
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 700,
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}
