'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function NouveauNumeroPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [description, setDescription] = useState('')
  const [published, setPublished] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      setLoadingMsg('Création du numéro...')
      const res = await fetch('/api/admin/revue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, month, year, description, published }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (epubFile) {
        setLoadingMsg(`Upload du epub (${(epubFile.size / 1024 / 1024).toFixed(1)} Mo)...`)
        const epubRes = await fetch(`/api/admin/revue/${data.id}/epub`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/epub+zip' },
          body: epubFile,
        })
        if (!epubRes.ok) throw new Error('Erreur upload epub')
      }

      if (pdfFile) {
        setLoadingMsg(`Upload du PDF (${(pdfFile.size / 1024 / 1024).toFixed(1)} Mo)...`)
        const pdfRes = await fetch(`/api/admin/revue/${data.id}/pdf`, {
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

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-cream mb-6">Nouveau numéro de la revue</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">Titre</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="ex : Santé Essentielle — Numéro 1"
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
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-dark border border-dark-4 focus:border-gold/60 text-cream text-sm px-4 py-3 outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">
            Fichier epub <span className="text-gold normal-case">(prioritaire)</span>
          </label>
          <input
            type="file"
            accept=".epub,application/epub+zip"
            onChange={e => setEpubFile(e.target.files?.[0] ?? null)}
            className="w-full text-cream-muted text-xs file:mr-3 file:py-2 file:px-4 file:border file:border-gold/40 file:text-gold file:text-xs file:bg-transparent file:cursor-pointer hover:file:border-gold"
          />
          {epubFile && <p className="text-xs text-green-400 mt-1">✓ {epubFile.name}</p>}
        </div>

        <div>
          <label className="text-xs text-cream-muted uppercase tracking-widest block mb-2">
            Fichier PDF <span className="normal-case text-cream-muted/60">(optionnel, affiché si pas d'epub)</span>
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
            className="w-full text-cream-muted text-xs file:mr-3 file:py-2 file:px-4 file:border file:border-gold/40 file:text-gold file:text-xs file:bg-transparent file:cursor-pointer hover:file:border-gold"
          />
          {pdfFile && <p className="text-xs text-green-400 mt-1">✓ {pdfFile.name}</p>}
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
            Publier immédiatement (visible par les abonnés)
          </label>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gold hover:bg-gold-light text-dark font-semibold py-2.5 px-6 text-xs uppercase tracking-widest transition-colors disabled:opacity-60"
          >
            {loading ? loadingMsg : 'Créer le numéro'}
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
