'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface AuthorData {
  id?: string
  slug: string
  name: string
  role: string
  bio: string
  photo: string
  facebook: string
  instagram: string
}

interface Props { initial?: Partial<AuthorData> }

export default function AuthorForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>(initial?.photo ?? '')

  const [form, setForm] = useState<AuthorData>({
    id: initial?.id ?? '',
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    role: initial?.role ?? 'Auteur',
    bio: initial?.bio ?? '',
    photo: initial?.photo ?? '',
    facebook: initial?.facebook ?? '',
    instagram: initial?.instagram ?? '',
  })

  function set(key: keyof AuthorData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isEdit ? `/api/admin/authors/${form.id}` : '/api/admin/authors'
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
      const author = await res.json()
      if (photoFile) {
        const photoRes = await fetch(`/api/admin/authors/${author.id}/photo`, {
          method: 'POST',
          headers: { 'Content-Type': photoFile.type },
          body: photoFile,
        })
        if (!photoRes.ok) {
          const d = await photoRes.json().catch(() => ({}))
          throw new Error(
            d.error ?? "L'auteur a été enregistré mais l'envoi de la photo a échoué. Modifiez l'auteur pour réessayer."
          )
        }
      }
      router.push('/admin/auteurs')
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
        <label className="text-xs text-cream-muted uppercase tracking-widest">Nom complet</label>
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => {
            set('name', e.target.value)
            if (!isEdit) set('slug', autoSlug(e.target.value))
          }}
          className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Slug (URL)</label>
        <input
          required
          type="text"
          value={form.slug}
          onChange={(e) => set('slug', e.target.value)}
          className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Rôle</label>
        <input
          type="text"
          value={form.role}
          onChange={(e) => set('role', e.target.value)}
          placeholder="Auteur, Fondateur, Illustrateur..."
          className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-cream-muted/40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Biographie</label>
        <textarea
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          rows={5}
          className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-cream-muted uppercase tracking-widest">Photo</label>
        <div className="flex gap-4 items-center">
          {photoPreview && (
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-dark-4 shrink-0">
              <Image src={photoPreview} alt="Photo" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1">
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} className="hidden" />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full border border-dashed border-dark-4 hover:border-gold/40 text-cream-muted hover:text-cream text-xs py-3 transition-colors text-center"
            >
              {photoFile ? photoFile.name : photoPreview ? 'Changer la photo' : 'Choisir une photo (.jpg, .png)'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <label className="text-[11px] text-cream-muted/70 normal-case tracking-normal">
            …ou chemin de l&apos;image (recommandé)
          </label>
          <input
            type="text"
            value={photoFile ? '' : form.photo}
            disabled={!!photoFile}
            onChange={(e) => {
              set('photo', e.target.value)
              setPhotoPreview(e.target.value)
            }}
            placeholder="/images/authors/exauce-kalala.jpg"
            className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-cream-muted/40 disabled:opacity-50"
          />
          <p className="text-[11px] text-cream-muted/60 leading-relaxed">
            Placez le fichier dans <span className="text-gold/80">public/images/authors/</span> puis écrivez son chemin ici (minuscules, sans espace).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-cream-muted uppercase tracking-widest">Facebook (URL)</label>
          <input
            type="text"
            value={form.facebook}
            onChange={(e) => set('facebook', e.target.value)}
            placeholder="https://facebook.com/..."
            className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-cream-muted/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-cream-muted uppercase tracking-widest">Instagram (URL)</label>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => set('instagram', e.target.value)}
            placeholder="https://instagram.com/..."
            className="bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-cream-muted/40"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gold hover:bg-gold-light text-dark font-semibold px-6 py-3 text-xs uppercase tracking-widest transition-colors disabled:opacity-60"
        >
          {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'auteur'}
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
