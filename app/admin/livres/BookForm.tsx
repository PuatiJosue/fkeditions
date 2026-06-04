'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Author { id: string; name: string }

interface BookData {
  id?: string; slug: string; title: string; description: string; content: string
  price: string; pricePhysical: string; priceAudio: string; category: string; type: string; stock: string; year: string
  pages: string; audioDuration: string; coverImage: string; pdfFile: string; epubFile: string; audioFile: string
  published: boolean
  preOrder: boolean; releaseDate: string; authorId: string; coAuthors: string
  isMagazine: boolean
}

interface Props { authors: Author[]; initial?: Partial<BookData> }

const CATEGORIES = ['Roman', 'Jeunesse', 'Essai', 'Poésie', 'Thriller', 'Fantasy', 'Biographie', 'Portrait', 'Histoire', 'Géographie', 'Politique', 'Pratique', 'Cuisine', 'Éducation', 'Spiritualité', 'Magazine', 'Autre']

export default function BookForm({ authors, initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)
  const epubInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(initial?.coverImage ?? '')
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [epubName, setEpubName] = useState(initial?.epubFile ? initial.epubFile.split('/').pop() ?? '' : '')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioName, setAudioName] = useState(initial?.audioFile ? initial.audioFile.split('/').pop() ?? '' : '')

  const [form, setForm] = useState<BookData>({
    id: initial?.id ?? '', slug: initial?.slug ?? '', title: initial?.title ?? '',
    description: initial?.description ?? '', content: initial?.content ?? '',
    price: initial?.price ?? '', pricePhysical: initial?.pricePhysical ?? '',
    priceAudio: initial?.priceAudio ?? '', category: initial?.category ?? 'Roman',
    type: initial?.type ?? 'EBOOK', stock: initial?.stock ?? '',
    year: initial?.year ?? '', pages: initial?.pages ?? '', audioDuration: initial?.audioDuration ?? '',
    coverImage: initial?.coverImage ?? '', pdfFile: initial?.pdfFile ?? '', epubFile: initial?.epubFile ?? '',
    audioFile: initial?.audioFile ?? '',
    published: initial?.published ?? true, preOrder: initial?.preOrder ?? false,
    releaseDate: initial?.releaseDate ?? '', authorId: initial?.authorId ?? '',
    coAuthors: initial?.coAuthors ?? '',
    isMagazine: initial?.isMagazine ?? false,
  })

  const set = (key: keyof BookData, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  function autoSlug(title: string) {
    return title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  }

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setCoverFile(file); setCoverPreview(URL.createObjectURL(file))
  }

  function onEpubChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setEpubFile(file); setEpubName(file.name)
  }

  function onAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setAudioFile(file); setAudioName(file.name)
    // Try to extract duration from the file
    try {
      const audio = new Audio(URL.createObjectURL(file))
      audio.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(audio.duration)) {
          set('audioDuration', String(Math.round(audio.duration)))
        }
      })
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setUploadStatus('')
    try {
      const url = isEdit ? `/api/admin/books/${form.id}` : '/api/admin/books'
      const contentArray = form.content.trim()
        ? form.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) : null
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, content: contentArray }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Erreur') }
      const { id: bookId } = await res.json()
      if (coverFile) {
        setUploadStatus('Upload de la couverture…')
        await fetch(`/api/admin/books/${bookId}/cover`, { method: 'POST', headers: { 'Content-Type': coverFile.type }, body: coverFile })
      }
      if (epubFile) {
        setUploadStatus('Upload du fichier ePub…')
        await fetch(`/api/admin/books/${bookId}/epub`, { method: 'POST', headers: { 'Content-Type': 'application/epub+zip' }, body: epubFile })
      }
      if (audioFile) {
        setUploadStatus('Upload du fichier audio…')
        await fetch(`/api/admin/books/${bookId}/audio`, {
          method: 'POST',
          headers: { 'Content-Type': audioFile.type || 'audio/mpeg' },
          body: audioFile,
        })
      }
      router.push(form.isMagazine ? '/admin/magazine' : '/admin/livres'); router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setSaving(false); setUploadStatus('')
    }
  }

  const cls = 'bg-dark border border-dark-4 focus:border-gold/50 text-cream text-sm px-3 py-2.5 outline-none transition-colors'
  const lbl = 'text-xs text-cream-muted uppercase tracking-widest'
  const pickBtn = 'w-full border border-dashed border-dark-4 hover:border-gold/40 text-cream-muted hover:text-cream text-xs py-3 transition-colors text-center'

  const field = (label: string, key: keyof BookData, type = 'text', placeholder = '', note = '') => (
    <div className="flex flex-col gap-1">
      <label className={lbl}>{label}</label>
      <input type={type} value={form[key] as string} onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder} className={`${cls} placeholder:text-cream-muted/40`} />
      {note && <p className="text-[11px] text-cream-muted/60">{note}</p>}
    </div>
  )

  const sel = (label: string, key: keyof BookData, opts: { value: string; label: string }[]) => (
    <div className="flex flex-col gap-1">
      <label className={lbl}>{label}</label>
      <select value={form[key] as string} onChange={(e) => set(key, e.target.value)} className={cls}>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  const check = (id: string, label: string, key: 'published' | 'preOrder') => (
    <div className="flex items-center gap-3">
      <input type="checkbox" id={id} checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="accent-gold" />
      <label htmlFor={id} className="text-sm text-cream-dim cursor-pointer">{label}</label>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3">{error}</div>}

      <div className="flex flex-col gap-1">
        <label className={lbl}>Titre</label>
        <input type="text" required value={form.title} className={cls}
          onChange={(e) => { set('title', e.target.value); if (!isEdit) set('slug', autoSlug(e.target.value)) }} />
      </div>

      {field('Slug (URL)', 'slug', 'text', 'ex: mon-livre')}

      <div className="flex flex-col gap-1">
        <label className={lbl}>Description</label>
        <textarea required value={form.description} onChange={(e) => set('description', e.target.value)}
          rows={4} className={`${cls} resize-none`} />
      </div>

      <div className="flex flex-col gap-1">
        <label className={lbl}>Extrait (optionnel)</label>
        <p className="text-[11px] text-cream-muted/70 mb-1">
          Séparez chaque paragraphe par une ligne vide. Les 3 premiers s&apos;afficheront sur la page du livre.
        </p>
        <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={8}
          placeholder={"Prologue\n\nIl était une fois dans la ville de Kinshasa...\n\nLe lendemain matin, il se réveilla avec une idée..."}
          className={`${cls} resize-y font-mono`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field('Prix Ebook ($)', 'price', 'number', '9.99')}
        {field('Prix Livre physique ($)', 'pricePhysical', 'number', 'Laisser vide si non disponible')}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field('Prix Livre audio ($)', 'priceAudio', 'number', 'ex: 14.99 — laisser vide si pas d\'audio')}
        {field('Durée audio (secondes)', 'audioDuration', 'number', 'Auto-rempli si fichier uploadé')}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sel('Catégorie', 'category', CATEGORIES.map((c) => ({ value: c, label: c })))}
        {sel('Type par défaut', 'type', [{ value: 'EBOOK', label: 'Ebook (ePub)' }, { value: 'PHYSICAL', label: 'Livre physique' }])}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field('Année', 'year', 'number', '2024')}
        {field('Pages', 'pages', 'number', '150')}
      </div>

      {sel('Auteur principal', 'authorId', [
        { value: '', label: '— Aucun auteur lié —' },
        ...authors.map((a) => ({ value: a.id, label: a.name })),
      ])}

      {field('Co-auteurs / Collaborateurs', 'coAuthors', 'text', 'ex: Daniela Kayiba, Jean Mutombo',
        'Sépare les noms par une virgule si plusieurs collaborateurs.')}

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label className={lbl}>Image de couverture</label>
        <div className="flex gap-4 items-start">
          {coverPreview && (
            <div className="relative w-16 h-24 shrink-0 border border-dark-4 overflow-hidden">
              <Image src={coverPreview} alt="Couverture" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 flex flex-col gap-2">
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onCoverChange} className="hidden" />
            <button type="button" onClick={() => coverInputRef.current?.click()} className={pickBtn}>
              {coverFile ? coverFile.name : coverPreview ? "Changer l'image" : 'Choisir une image (.jpg, .png)'}
            </button>
            {!coverFile && !coverPreview && (
              <input type="text" value={form.coverImage} placeholder="Ou coller une URL d'image..."
                onChange={(e) => { set('coverImage', e.target.value); setCoverPreview(e.target.value) }}
                className={`${cls} text-xs placeholder:text-cream-muted/40`} />
            )}
          </div>
        </div>
      </div>

      {/* ePub upload */}
      {form.type === 'EBOOK' && (
        <div className="flex flex-col gap-2">
          <label className={lbl}>Fichier ePub</label>
          <input ref={epubInputRef} type="file" accept=".epub,application/epub+zip" onChange={onEpubChange} className="hidden" />
          <button type="button" onClick={() => epubInputRef.current?.click()} className={pickBtn}>
            {epubName ? `📖 ${epubName}` : 'Choisir le fichier ePub du livre'}
          </button>
          {epubName && !epubFile && (
            <p className="text-[11px] text-cream-muted/60">Fichier actuel : {epubName}. Choisissez un nouveau fichier pour le remplacer.</p>
          )}
        </div>
      )}

      {/* Audio upload */}
      <div className="flex flex-col gap-2">
        <label className={lbl}>Fichier audio (livre audio)</label>
        <p className="text-[11px] text-cream-muted/70">
          Formats acceptés : MP3, M4A, AAC, OGG. Le prix audio est généralement plus élevé que l&apos;ebook.
        </p>
        <input ref={audioInputRef} type="file" accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav" onChange={onAudioChange} className="hidden" />
        <button type="button" onClick={() => audioInputRef.current?.click()} className={pickBtn}>
          {audioName ? `🎧 ${audioName}` : 'Choisir le fichier audio du livre'}
        </button>
        {audioName && !audioFile && (
          <p className="text-[11px] text-cream-muted/60">Fichier actuel : {audioName}. Choisissez un nouveau fichier pour le remplacer.</p>
        )}
        {!form.priceAudio && audioName && (
          <p className="text-[11px] text-yellow-500/80">⚠ N&apos;oubliez pas de renseigner un prix audio sinon le livre ne sera pas vendable en audio.</p>
        )}
      </div>

      {check('published', 'Publié (visible sur le site)', 'published')}
      {check('preOrder', 'Mode pré-commande (paiement maintenant, accès à la date de sortie)', 'preOrder')}
      {form.preOrder && field('Date de sortie', 'releaseDate', 'date')}

      <div className="flex gap-3 pt-2 items-center">
        <button type="submit" disabled={saving}
          className="bg-gold hover:bg-gold-light text-dark font-semibold px-6 py-3 text-xs uppercase tracking-widest transition-colors disabled:opacity-60">
          {saving ? (uploadStatus || 'Enregistrement…') : isEdit ? 'Mettre à jour' : 'Créer le livre'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 text-xs text-cream-muted border border-dark-4 hover:border-dark-3 uppercase tracking-widest transition-colors">
          Annuler
        </button>
      </div>
    </form>
  )
}
