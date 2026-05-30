'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function EditRevuePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [description, setDescription] = useState('')
  const [published, setPublished] = useState(false)
  const [hasPdf, setHasPdf] = useState(false)
  const [hasEpub, setHasEpub] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/revue/${id}`)
      .then(r => r.json())
      .then(data => {
        setTitle(data.title ?? '')
        setMonth(data.month ?? 1)
        setYear(data.year ?? new Date().getFullYear())
        setDescription(data.description ?? '')
        setPublished(data.published ?? false)
        setHasPdf(!!data.pdfFile)
        setHasEpub(!!data.epubFile)
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/revue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, month, year, description, published }),
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour')

      if (epubFile) {
        const epubRes = await fetch(`/api/admin/revue/${id}/epub`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/epub+zip' },
          body: epubFile,
        })
        if (!epubRes.ok) throw new Error('Erreur upload epub')
      }

      if (pdfFile) {
        const pdfRes = await fetch(`/api/admin/revue/${id}/pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/pdf' },
          body: pdfFile,
        })
        if (!pdfRes.ok) throw new Error('Erreur upload PDF')
      }

      router.push('/admin/revue')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setLoading(false)
    }
  }

  if (fetching) return <p className="text-cream-muted text-sm">Chargement...</p>

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-cream mb-6">Modifier le numéro</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">Titre</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-dark border border-dark-4 focus:border-gold/60 text-cream text-sm px-4 py-3 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">Mois</label>
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
              className="w-full bg-dark border border-dark-4 focus:border-gold/60 text-cream text-sm px-4 py-3 outline-none"
            >
              {MONTHS.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">Année</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              min={2024}
              max={2030}
              className="w-full bg-dark border border-dark-4 focus:border-gold/60 text-cream text-sm px-4 py-3 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">Description (optionnel)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-dark border border-dark-4 focus:border-gold/60 text-cream text-sm px-4 py-3 outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">
            Fichier epub <span className="text-gold normal-case">(prioritaire)</span>{hasEpub && <span className="text-green-400 normal-case ml-1">(déjà uploadé)</span>}
          </label>
          <input
            type="file"
            accept=".epub,application/epub+zip"
            onChange={e => setEpubFile(e.target.files?.[0] ?? null)}
            className="w-full text-cream-muted text-xs file:mr-3 file:py-2 file:px-4 file:border file:border-gold/40 file:text-gold file:text-xs file:bg-transparent file:cursor-pointer hover:file:border-gold"
          />
          {epubFile && <p className="text-xs text-green-400 mt-1">✓ {epubFile.name}</p>}
          {hasEpub && !epubFile && <p className="text-xs text-cream-muted mt-1">Laisse vide pour garder l&apos;epub actuel</p>}
        </div>

        <div>
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">
            Fichier PDF {hasPdf && <span className="text-green-400 normal-case">(déjà uploadé)</span>}
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
            className="w-full text-cream-muted text-xs file:mr-3 file:py-2 file:px-4 file:border file:border-gold/40 file:text-gold file:text-xs file:bg-transparent file:cursor-pointer hover:file:border-gold"
          />
          {pdfFile && <p className="text-xs text-green-400 mt-1">✓ {pdfFile.name}</p>}
          {hasPdf && !pdfFile && <p className="text-xs text-cream-muted mt-1">Laisse vide pour garder le PDF actuel</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            className="w-4 h-4 accent-gold"
          />
          <label htmlFor="published" className="text-sm text-cream-muted cursor-pointer">
            Publié (visible par les abonnés)
          </label>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gold hover:bg-gold-light text-dark font-semibold py-2.5 px-6 text-xs uppercase tracking-widest transition-colors disabled:opacity-60"
          >
            {loading ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/revue')}
            className="border border-dark-4 hover:border-gold/40 text-cream-muted text-xs uppercase tracking-widest px-6 py-2.5 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
