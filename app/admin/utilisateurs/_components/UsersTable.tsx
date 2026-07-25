import type { ReactNode } from 'react'
import type { UserRow } from './types'
import type { UserActions } from './useUserActions'
import StatusPill from './StatusPill'

function ActionBtn({ onClick, disabled, color, children }: { onClick: () => void; disabled?: boolean; color: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${color}`, color, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap', fontFamily: 'inherit' }}
    >
      {children}
    </button>
  )
}

function UserTableRow({ user: u, actions }: { user: UserRow; actions: UserActions }) {
  const disabled = actions.busy === u.id
  return (
    <tr style={{ opacity: u.deletedAt ? 0.6 : 1 }}>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{u.name || '—'}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{u.email}</span>
          {u.blocked && u.blockedReason && (
            <span style={{ fontSize: 11, color: '#ea580c', fontStyle: 'italic', marginTop: 4 }}>⚠ {u.blockedReason}</span>
          )}
        </div>
      </td>
      <td><StatusPill user={u} /></td>
      <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>{u.purchaseCount}</td>
      <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>{u.commentCount}</td>
      <td style={{ color: 'var(--ink-mute)', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {u.role !== 'ADMIN' && (
            <>
              {!u.blocked && !u.deletedAt && (
                <ActionBtn onClick={() => actions.blockUser(u.id)} disabled={disabled} color="#ea580c">🟠 Bloquer</ActionBtn>
              )}
              {u.blocked && (
                <ActionBtn onClick={() => actions.unblockUser(u.id)} disabled={disabled} color="#16a34a">✓ Débloquer</ActionBtn>
              )}
              {!u.deletedAt && (
                <ActionBtn onClick={() => actions.suspendUser(u.id)} disabled={disabled} color="#7f1d1d">🔴 Suspendre</ActionBtn>
              )}
              {u.deletedAt && (
                <ActionBtn onClick={() => actions.restoreUser(u.id)} disabled={disabled} color="#16a34a">↺ Réactiver</ActionBtn>
              )}
            </>
          )}
          <ActionBtn onClick={() => actions.toggleRole(u.id, u.role)} disabled={disabled} color="var(--accent)">
            {u.role === 'ADMIN' ? '↓ Retirer admin' : '↑ Promouvoir admin'}
          </ActionBtn>
        </div>
      </td>
    </tr>
  )
}

/** Tableau des utilisateurs avec actions de modération. */
export default function UsersTable({ users, actions }: { users: UserRow[]; actions: UserActions }) {
  return (
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
          {users.map((u) => (
            <UserTableRow key={u.id} user={u} actions={actions} />
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-mute)' }}>
                Aucun utilisateur dans cette catégorie
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
