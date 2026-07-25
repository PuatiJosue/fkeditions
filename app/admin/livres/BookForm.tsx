'use client'

import Image from 'next/image'
import { useBookForm } from './_components/useBookForm'
import { Field, Select, Checkbox } from './_components/FormFields'
import MagazineFeaturedFields from './_components/MagazineFeaturedFields'
import { inputCls, labelCls, pickBtnCls } from './_components/styles'
import { CATEGORIES, type Author, type BookData } from './_components/types'

interface Props { authors: Author[]; initial?: Partial<BookData> }

export default function BookForm({ authors, initial }: Props) {
  const f = useBookForm(initial)
  const { form, set } = f

  return (
    <form onSubmit={f.handleSubmit} className="max-w-2xl space-y-5">
      {f.error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3">{f.error}</div>}

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Titre</label>
        <input type="text" required value={form.title} className={inputCls} onChange={(e) => f.setTitle(e.target.value)} />
      </div>

      <Field label="Slug (URL)" value={form.slug} onChange={(v) => set('slug', v)} placeholder="ex: mon-livre" />

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Description</label>
        <textarea required value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className={`${inputCls} resize-none`} />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Extrait (optionnel)</label>
        <p className="text-[11px] text-cream-muted/70 mb-1">
          Séparez chaque paragraphe par une ligne vide. Les 3 premiers s&apos;afficheront sur la page du livre.
        </p>
        <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={8}
          placeholder={"Prologue\n\nIl était une fois dans la ville de Kinshasa...\n\nLe lendemain matin, il se réveilla avec une idée..."}
          className={`${inputCls} resize-y font-mono`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix Ebook ($)" value={form.price} onChange={(v) => set('price', v)} type="number" placeholder="9.99" />
        <Field label="Prix Livre physique ($)" value={form.pricePhysical} onChange={(v) => set('pricePhysical', v)} type="number" placeholder="Laisser vide si non disponible" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix Livre audio ($)" value={form.priceAudio} onChange={(v) => set('priceAudio', v)} type="number" placeholder="ex: 14.99 — laisser vide si pas d'audio" />
        <Field label="Durée audio (secondes)" value={form.audioDuration} onChange={(v) => set('audioDuration', v)} type="number" placeholder="Auto-rempli si fichier uploadé" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Catégorie" value={form.category} onChange={(v) => set('category', v)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <Select label="Type par défaut" value={form.type} onChange={(v) => set('type', v)} options={[{ value: 'EBOOK', label: 'Ebook (ePub)' }, { value: 'PHYSICAL', label: 'Livre physique' }]} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Année" value={form.year} onChange={(v) => set('year', v)} type="number" placeholder="2024" />
        <Field label="Pages" value={form.pages} onChange={(v) => set('pages', v)} type="number" placeholder="150" />
      </div>

      <Select label="Auteur principal" value={form.authorId} onChange={(v) => set('authorId', v)}
        options={[{ value: '', label: '— Aucun auteur lié —' }, ...authors.map((a) => ({ value: a.id, label: a.name }))]} />

      <Field label="Co-auteurs / Collaborateurs" value={form.coAuthors} onChange={(v) => set('coAuthors', v)}
        placeholder="ex: Daniela Kayiba, Jean Mutombo" note="Sépare les noms par une virgule si plusieurs collaborateurs." />

      {/* Couverture */}
      <div className="flex flex-col gap-2">
        <label className={labelCls}>Image de couverture</label>
        <div className="flex gap-4 items-start">
          {f.coverPreview && (
            <div className="relative w-16 h-24 shrink-0 border border-dark-4 overflow-hidden">
              <Image src={f.coverPreview} alt="Couverture" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 flex flex-col gap-2">
            <input ref={f.coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={f.onCoverChange} className="hidden" />
            <button type="button" onClick={() => f.coverInputRef.current?.click()} className={pickBtnCls}>
              {f.coverFile ? f.coverFile.name : f.coverPreview ? "Changer l'image" : 'Choisir une image (.jpg, .png)'}
            </button>
            {!f.coverFile && !f.coverPreview && (
              <input type="text" value={form.coverImage} placeholder="Ou coller une URL d'image..."
                onChange={(e) => { set('coverImage', e.target.value); f.setCoverPreview(e.target.value) }}
                className={`${inputCls} text-xs placeholder:text-cream-muted/40`} />
            )}
          </div>
        </div>
      </div>

      {form.isMagazine && (
        <MagazineFeaturedFields form={form} set={set} featuredInputRef={f.featuredInputRef} featuredPreview={f.featuredPreview} featuredFile={f.featuredFile} onFeaturedChange={f.onFeaturedChange} />
      )}

      {/* ePub */}
      {form.type === 'EBOOK' && (
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Fichier ePub</label>
          <input ref={f.epubInputRef} type="file" accept=".epub,application/epub+zip" onChange={f.onEpubChange} className="hidden" />
          <button type="button" onClick={() => f.epubInputRef.current?.click()} className={pickBtnCls}>
            {f.epubName ? `📖 ${f.epubName}` : 'Choisir le fichier ePub du livre'}
          </button>
          {f.epubName && !f.epubFile && (
            <p className="text-[11px] text-cream-muted/60">Fichier actuel : {f.epubName}. Choisissez un nouveau fichier pour le remplacer.</p>
          )}
        </div>
      )}

      {/* Audio */}
      <div className="flex flex-col gap-2">
        <label className={labelCls}>Fichier audio (livre audio)</label>
        <p className="text-[11px] text-cream-muted/70">
          Formats acceptés : MP3, M4A, AAC, OGG. Le prix audio est généralement plus élevé que l&apos;ebook.
        </p>
        <input ref={f.audioInputRef} type="file" accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav" onChange={f.onAudioChange} className="hidden" />
        <button type="button" onClick={() => f.audioInputRef.current?.click()} className={pickBtnCls}>
          {f.audioName ? `🎧 ${f.audioName}` : 'Choisir le fichier audio du livre'}
        </button>
        {f.audioName && !f.audioFile && (
          <p className="text-[11px] text-cream-muted/60">Fichier actuel : {f.audioName}. Choisissez un nouveau fichier pour le remplacer.</p>
        )}
        {!form.priceAudio && f.audioName && (
          <p className="text-[11px] text-yellow-500/80">⚠ N&apos;oubliez pas de renseigner un prix audio sinon le livre ne sera pas vendable en audio.</p>
        )}
      </div>

      <Checkbox id="published" label="Publié (visible sur le site)" checked={form.published} onChange={(v) => set('published', v)} />
      <Checkbox id="preOrder" label="Mode pré-commande (paiement maintenant, accès à la date de sortie)" checked={form.preOrder} onChange={(v) => set('preOrder', v)} />
      {form.preOrder && <Field label="Date de sortie" value={form.releaseDate} onChange={(v) => set('releaseDate', v)} type="date" />}

      <div className="flex gap-3 pt-2 items-center">
        <button type="submit" disabled={f.saving}
          className="bg-gold hover:bg-gold-light text-dark font-semibold px-6 py-3 text-xs uppercase tracking-widest transition-colors disabled:opacity-60">
          {f.saving ? (f.uploadStatus || 'Enregistrement…') : f.isEdit ? 'Mettre à jour' : 'Créer le livre'}
        </button>
        <button type="button" onClick={f.back}
          className="px-6 py-3 text-xs text-cream-muted border border-dark-4 hover:border-dark-3 uppercase tracking-widest transition-colors">
          Annuler
        </button>
      </div>
    </form>
  )
}
