'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EventData {
  id?: string
  title: string
  description: string
  date: string
  location: string
  imageUrl: string
  published: boolean
}

interface Props { initial?: Partial<EventData> }

export default function EventForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<EventData>({
    id: initial?.id ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    date: initial?.date ?? '',
    location: initial?.location ?? '',
    imageUrl: initial?.imageUrl ?? '',
    published: initial?.published ?? true,
  })

  function set(key: keyof EventData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isEdit ? `/api/admin/events/${form.id}` : '/api/admin/events'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur')
      }
      router.push('/admin/evenements')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3">{error}</div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Titre de l&apos;événement</label>
        <input
          required
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-cream-muted uppercase tracking-widest">Date et heure</label>
          <input
            required
            type="datetime-local"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-cream-muted uppercase tracking-widest">Lieu</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Kinshasa, DRC"
            className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-cream-muted/40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Image (URL ou chemin)</label>
        <input
          type="text"
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
          placeholder="/images/events/..."
          className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-cream-muted/40"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={form.published}
          onChange={(e) => set('published', e.target.checked)}
          className="accent-gold"
        />
        <label htmlFor="published" className="text-sm text-cream-dim cursor-pointer">
          Publié (visible sur le site)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gold hover:bg-gold-light text-dark font-semibold px-6 py-3 text-xs uppercase tracking-widest transition-colors disabled:opacity-60"
        >
          {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'événement'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-xs text-cream-muted border border-dark-4 hover:border-dark-3 uppercase tracking-widest transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
