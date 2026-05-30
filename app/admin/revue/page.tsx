'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RevueIssue {
  id: string
  title: string
  month: number
  year: number
  description: string | null
  pdfFile: string | null
  published: boolean
  createdAt: string
}

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function AdminRevuePage() {
  const [issues, setIssues] = useState<RevueIssue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/revue')
      .then(r => r.json())
      .then(data => {
        setIssues(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function togglePublished(issue: RevueIssue) {
    const res = await fetch(`/api/admin/revue/${issue.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !issue.published }),
    })
    if (res.ok) {
      setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, published: !i.published } : i))
    }
  }

  async function deleteIssue(id: string) {
    if (!confirm('Supprimer ce numéro ?')) return
    const res = await fetch(`/api/admin/revue/${id}`, { method: 'DELETE' })
    if (res.ok) setIssues(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-cream">Numéros de la Revue</h1>
        <Link
          href="/admin/revue/nouveau"
          className="bg-gold hover:bg-gold-light text-dark text-xs font-semibold uppercase tracking-widest px-4 py-2 transition-colors"
        >
          + Nouveau numéro
        </Link>
      </div>

      {loading ? (
        <p className="text-cream-muted text-sm">Chargement...</p>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 bg-dark-3 border border-dark-4">
          <p className="text-cream-muted text-sm mb-4">Aucun numéro pour l&apos;instant.</p>
          <Link href="/admin/revue/nouveau" className="text-gold text-xs underline">
            Ajouter le premier numéro
          </Link>
        </div>
      ) : (
        <div className="bg-dark-3 border border-dark-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dark-4 text-cream-muted">
                <th className="text-left px-4 py-3 font-medium">Numéro</th>
                <th className="text-left px-4 py-3 font-medium">Période</th>
                <th className="text-left px-4 py-3 font-medium">PDF</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id} className="border-b border-dark-4">
                  <td className="px-4 py-3 text-cream">{issue.title}</td>
                  <td className="px-4 py-3 text-cream-muted">{MONTHS[issue.month]} {issue.year}</td>
                  <td className="px-4 py-3">
                    {issue.pdfFile ? (
                      <span className="text-green-400">✓ Uploadé</span>
                    ) : (
                      <span className="text-orange-400">Manquant</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(issue)}
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wide border transition-colors ${
                        issue.published
                          ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'
                      }`}
                    >
                      {issue.published ? 'Publié' : 'Brouillon'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {issue.pdfFile && (
                        <a
                          href={`/api/admin/revue/${issue.id}/pdf`}
                          className="text-cream-muted hover:text-cream transition-colors"
                        >
                          PDF
                        </a>
                      )}
                      <Link
                        href={`/admin/revue/${issue.id}`}
                        className="text-gold hover:text-gold-light transition-colors"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => deleteIssue(issue.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
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
