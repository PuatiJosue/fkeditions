'use client'

import { useEffect, useState } from 'react'

interface AuditEntry {
  id: string; adminEmail: string; action: string; target?: string; details?: string; createdAt: string
}
interface LoginEntry {
  id: string; ip?: string; userAgent?: string; success: boolean; createdAt: string
  country?: string; city?: string
  user: { email: string; name?: string }
}

const actionLabel: Record<string, string> = {
  VALIDATE_ORDER: '✓ Commande validée',
  REJECT_ORDER: '✕ Commande rejetée',
  VALIDATE_SUBSCRIPTION: '✓ Abonnement validé',
  REJECT_SUBSCRIPTION: '✕ Abonnement rejeté',
  CHANGE_ROLE: '⟳ Rôle modifié',
  DELETE_USER: '🗑 Utilisateur supprimé',
  UPLOAD_PDF: '↑ PDF uploadé',
}

export default function JournalPage() {
  const [tab, setTab] = useState<'audit' | 'logins'>('audit')
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [logins, setLogins] = useState<LoginEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/journal?type=${tab}`)
      .then(r => r.json())
      .then(data => {
        if (tab === 'audit') setLogs(data.logs ?? [])
        else setLogins(data.logins ?? [])
        setLoading(false)
      })
  }, [tab])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Journal de sécurité</h1>
        <p className="text-xs text-cream-muted mt-1">Historique des actions admin et des connexions</p>
      </div>

      <div className="flex border border-dark-4 mb-6 w-fit">
        <button onClick={() => setTab('audit')} className={`px-5 py-2 text-xs uppercase tracking-widest transition-colors ${tab === 'audit' ? 'bg-gold text-dark font-semibold' : 'text-cream-muted hover:text-cream'}`}>
          Actions admin
        </button>
        <button onClick={() => setTab('logins')} className={`px-5 py-2 text-xs uppercase tracking-widest transition-colors ${tab === 'logins' ? 'bg-gold text-dark font-semibold' : 'text-cream-muted hover:text-cream'}`}>
          Connexions
        </button>
      </div>

      {tab === 'audit' && (
        <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-dark-4 text-cream-muted">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Admin</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Cible</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="px-4 py-8 text-center text-cream-muted">Chargement...</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-cream-muted">Aucune action enregistrée</td></tr>}
              {logs.map(log => (
                <tr key={log.id} className="border-b border-dark-4 hover:bg-dark-4/30">
                  <td className="px-4 py-3 text-cream-muted whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-cream-dim">{log.adminEmail}</td>
                  <td className="px-4 py-3">
                    <span className={`${log.action.startsWith('VALIDATE') ? 'text-green-400' : log.action.startsWith('REJECT') || log.action.startsWith('DELETE') ? 'text-red-400' : 'text-gold'}`}>
                      {actionLabel[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream-muted max-w-[200px] truncate">
                    {log.details ?? log.target ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'logins' && (
        <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-dark-4 text-cream-muted">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
                <th className="text-left px-4 py-3 font-medium">IP / Localisation</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                <th className="text-left px-4 py-3 font-medium">Appareil</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-cream-muted">Chargement...</td></tr>}
              {!loading && logins.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-cream-muted">Aucune connexion enregistrée</td></tr>}
              {logins.map(login => (
                <tr key={login.id} className={`border-b border-dark-4 hover:bg-dark-4/30 ${!login.success ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3 text-cream-muted whitespace-nowrap">
                    {new Date(login.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-cream-dim">{login.user.name ?? '—'}</p>
                    <p className="text-cream-muted text-[10px]">{login.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-cream-muted font-mono text-[10px]">{login.ip ?? '—'}</p>
                    {(login.city || login.country) && (
                      <p className="text-cream-muted text-[10px] mt-0.5">{[login.city, login.country].filter(Boolean).join(', ')}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide ${login.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {login.success ? '✓ Succès' : '✕ Échec'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream-muted max-w-[200px] truncate text-[10px]">
                    {login.userAgent ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
